import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import type { Area } from '@/features/profile/types';
import { progressKeys } from '@/features/progress/api';
import { callFunction } from '@/lib/api';
import { supabase } from '@/lib/supabase';

import type { InterviewSession, Level, Question, QuestionCount, Report, Usage } from './types';

/** Todas as chaves do simulador começam com 'interview': invalidar essa raiz recarrega tudo. */
const keys = {
  all: ['interview'] as const,
  usage: (userId?: string) => ['interview', 'usage', userId] as const,
  session: (id: string) => ['interview', 'session', id] as const,
  result: (id: string) => ['interview', 'result', id] as const,
  completed: (userId?: string) => ['interview', 'completed', userId] as const,
  pending: (userId?: string) => ['interview', 'pending', userId] as const,
  nextStep: (userId?: string) => ['interview', 'nextStep', userId] as const,
};

function useUserId() {
  return useAuth().session?.user.id;
}

/** Contador do plano grátis (vem do servidor: função SQL interview_usage). */
export function useInterviewUsage() {
  const userId = useUserId();
  return useQuery({
    queryKey: keys.usage(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('interview_usage');
      if (error) throw error;
      return data as Usage;
    },
  });
}

export type StartInput = { area: Area; level: Level; num_questions: QuestionCount };

/** "Começar": pede as perguntas à IA e cria a sessão. Nunca repete sozinho (consome limite). */
export function useStartInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StartInput) => callFunction<{ session_id: string; questions: Question[] }>('start-interview', input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: keys.session(id),
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('interview_sessions').select('*').eq('id', id).single();
      if (error) throw error;
      return data as InterviewSession;
    },
  });
}

export type SubmitInput = { session_id: string; answers?: { question_id: string; answer_text: string }[] };

/** "Enviar e finalizar": salva as respostas e gera o feedback. */
export function useSubmitInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitInput) => callFunction<{ report: Report; overall_score: number }>('submit-interview', input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      // Concluir marca o dia como ativo: recarrega sequência, meta e números.
      queryClient.invalidateQueries({ queryKey: progressKeys.all });
    },
  });
}

export type InterviewResult = {
  session: InterviewSession;
  report: Report;
  /** Resposta de cada pergunta, por question_id. */
  answers: Record<string, string>;
};

/** Tudo que a T9 precisa: sessão, relatório e as respostas da pessoa. */
export function useInterviewResult(id: string) {
  return useQuery({
    queryKey: keys.result(id),
    enabled: !!id,
    queryFn: async (): Promise<InterviewResult> => {
      const [session, feedback, answers] = await Promise.all([
        supabase.from('interview_sessions').select('*').eq('id', id).single(),
        supabase.from('interview_feedback').select('report').eq('session_id', id).single(),
        supabase.from('interview_answers').select('question_id, answer_text').eq('session_id', id),
      ]);
      if (session.error) throw session.error;
      if (feedback.error) throw feedback.error;
      if (answers.error) throw answers.error;
      return {
        session: session.data as InterviewSession,
        report: feedback.data.report as Report,
        answers: Object.fromEntries((answers.data ?? []).map((a) => [a.question_id, a.answer_text])),
      };
    },
  });
}

/** Simulações concluídas, da mais recente para a mais antiga. */
export function useCompletedSessions() {
  const userId = useUserId();
  return useQuery({
    queryKey: keys.completed(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('id, created_at, area, level, num_questions, status, overall_score, completed_at')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Omit<InterviewSession, 'questions'>[];
    },
  });
}

/** "Próximo passo" do feedback mais recente (T5 "Treino de hoje"). null antes da primeira simulação. */
export function useLastNextStep() {
  const userId = useUserId();
  return useQuery({
    queryKey: keys.nextStep(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_feedback')
        .select('next_step:report->>next_step')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      const step = (data as { next_step: string | null } | null)?.next_step?.trim();
      return step ? step : null;
    },
  });
}

export type PendingSession ={ session: InterviewSession; answersSaved: boolean };

/**
 * Simulação que ficou pela metade (a mais recente em andamento).
 * answersSaved = true quando as respostas já foram enviadas e só falta o feedback.
 */
export function usePendingSession() {
  const userId = useUserId();
  return useQuery({
    queryKey: keys.pending(userId),
    enabled: !!userId,
    queryFn: async (): Promise<PendingSession | null> => {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const { count, error: countError } = await supabase
        .from('interview_answers')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', data.id);
      if (countError) throw countError;
      return { session: data as InterviewSession, answersSaved: (count ?? 0) > 0 };
    },
  });
}

/** "Sair sem salvar": marca a sessão como abandonada (o uso da semana não volta). */
export function useAbandonSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('interview_sessions').update({ status: 'abandoned' }).eq('id', id);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}
