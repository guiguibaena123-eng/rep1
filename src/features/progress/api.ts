import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

import type { SimulationRow } from './calendar';

/** Todas as chaves de progresso começam com 'progress': invalidar essa raiz recarrega tudo. */
export const progressKeys = {
  all: ['progress'] as const,
  activity: (userId?: string) => ['progress', 'activity', userId] as const,
  stats: (userId?: string) => ['progress', 'stats', userId] as const,
  times: (userId?: string) => ['progress', 'times', userId] as const,
};

/** Um pouco mais de um ano de dias ativos: suficiente para a sequência atual e a maior. */
const ACTIVITY_DAYS = 400;

export type UserStats = {
  total_completed: number;
  average_score: number | null;
  best_score: number | null;
  current_streak: number;
  longest_streak: number;
};

const EMPTY_STATS: UserStats = {
  total_completed: 0,
  average_score: null,
  best_score: null,
  current_streak: 0,
  longest_streak: 0,
};

/** Dias com atividade (AAAA-MM-DD, fuso de São Paulo), do mais recente para o mais antigo. */
export function useActivityDates() {
  const userId = useAuth().session?.user.id;
  return useQuery({
    queryKey: progressKeys.activity(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_activity')
        .select('activity_date')
        .order('activity_date', { ascending: false })
        .limit(ACTIVITY_DAYS);
      if (error) throw error;
      return (data ?? []).map((row) => row.activity_date as string);
    },
  });
}

/** Números do "Meu progresso" (view user_stats). Conta nova ainda não tem linha: vira tudo zero. */
export function useUserStats() {
  const userId = useAuth().session?.user.id;
  return useQuery({
    queryKey: progressKeys.stats(userId),
    enabled: !!userId,
    queryFn: async (): Promise<UserStats> => {
      const { data, error } = await supabase
        .from('user_stats')
        .select('total_completed, average_score, best_score, current_streak, longest_streak')
        .maybeSingle();
      if (error) throw error;
      return (data as UserStats | null) ?? EMPTY_STATS;
    },
  });
}

/** Início e fim das simulações concluídas (para o tempo por dia no calendário). */
export function useSimulationTimes() {
  const userId = useAuth().session?.user.id;
  return useQuery({
    queryKey: progressKeys.times(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('created_at, completed_at, num_questions')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(ACTIVITY_DAYS);
      if (error) throw error;
      return (data ?? []) as SimulationRow[];
    },
  });
}
