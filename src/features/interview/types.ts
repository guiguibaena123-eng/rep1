import type { Area, Goal } from '@/features/profile/types';

export const LEVELS = ['jovem_aprendiz', 'estagio', 'primeiro_emprego', 'junior'] as const;
export const QUESTION_COUNTS = [3, 5, 8] as const;
export const DEFAULT_QUESTION_COUNT = 5;

/** Resposta: mínimo para liberar "Enviar resposta" e limite do campo (decisões do README). */
export const ANSWER_MIN_CHARS = 20;
export const ANSWER_MAX_CHARS = 2000;
export const ANSWER_COUNTER_FROM = 1500;

/** Cerca de 2 minutos por pergunta (texto "Leva cerca de N minutos" da T6). */
export const MINUTES_PER_QUESTION = 2;

export type Level = (typeof LEVELS)[number];
export type QuestionCount = (typeof QUESTION_COUNTS)[number];
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export type Question = { id: string; text: string; hint: string };

/** Espelho de public.interview_sessions. */
export type InterviewSession = {
  id: string;
  created_at: string;
  area: Area;
  level: Level;
  num_questions: number;
  status: SessionStatus;
  questions: Question[];
  overall_score: number | null;
  completed_at: string | null;
};

/** Relatório salvo em interview_feedback.report (seção 9.3 do Prompt 2). */
export type Report = {
  overall_score: number;
  summary: string;
  encouragement: string;
  strengths: string[];
  improvements: { point: string; why: string; how: string }[];
  answer_reviews: { question_id: string; score: number; comment: string; suggested_answer: string }[];
  filler_words_detected: string[];
  next_step: string;
  questions: Question[];
};

export type Usage = { premium: boolean; used: number; limit: number; resets_at: string };

/** Nível sugerido pelo objetivo do perfil (T6). "Novo emprego" treina como júnior. */
export function levelFromGoal(goal: Goal | null | undefined): Level {
  switch (goal) {
    case 'jovem_aprendiz':
    case 'estagio':
    case 'primeiro_emprego':
      return goal;
    case 'novo_emprego':
      return 'junior';
    default:
      return 'primeiro_emprego';
  }
}

/** A resposta já pode ser enviada? (20+ caracteres sem contar espaços nas pontas) */
export function canSendAnswer(text: string) {
  return text.trim().length >= ANSWER_MIN_CHARS;
}
