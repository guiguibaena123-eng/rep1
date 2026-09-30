import { addDays, dateSP, weekStartSP } from '@/lib/dates';

/** Meta semanal de simulações do Premium (T5). Mude aqui para ajustar. */
export const WEEKLY_GOAL = 3;

/** Meta semanal do grátis: cabe no plano (1 simulação por semana) e as dicas lidas completam. */
export const FREE_GOAL = { sims: 1, tips: 2 } as const;

export type WeeklyGoal = {
  /** Quanto já conta para a meta (nunca passa de total). */
  done: number;
  total: number;
  sims: { done: number; goal: number };
  /** Só no grátis. */
  tips: { done: number; goal: number } | null;
};

/** Meta da semana conforme o plano: Premium = 3 simulações; grátis = 1 simulação + 2 dicas lidas. */
export function weeklyGoal(premium: boolean, simsThisWeek: number, tipsThisWeek: number): WeeklyGoal {
  if (premium) {
    const sims = Math.min(simsThisWeek, WEEKLY_GOAL);
    return { done: sims, total: WEEKLY_GOAL, sims: { done: sims, goal: WEEKLY_GOAL }, tips: null };
  }
  const sims = Math.min(simsThisWeek, FREE_GOAL.sims);
  const tips = Math.min(tipsThisWeek, FREE_GOAL.tips);
  return {
    done: sims + tips,
    total: FREE_GOAL.sims + FREE_GOAL.tips,
    sims: { done: sims, goal: FREE_GOAL.sims },
    tips: { done: tips, goal: FREE_GOAL.tips },
  };
}

/** A simulação grátis volta amanhã? (resets_at é sempre a próxima segunda, 00:00 em São Paulo.) */
export function resetsTomorrow(resetsAt: string, now: Date): boolean {
  return dateSP(new Date(resetsAt)) === addDays(dateSP(now), 1);
}

/** Quantas notas aparecem no gráfico "Sua evolução". */
export const CHART_POINTS = 5;

/** Sequências que ganham conquista (E07). */
export const STREAK_MILESTONES = [3, 7] as const;
export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

export type Streak = {
  /** Dias seguidos com atividade, contando até hoje (ou até ontem, se hoje ainda não treinou). */
  current: number;
  /** Primeiro dia da sequência atual (identifica a sequência, para comemorar só uma vez). */
  start: string | null;
  /** Já praticou hoje? Se não, e current > 0, a tela mostra "Uma simulação ou uma dica hoje…". */
  activeToday: boolean;
  longest: number;
};

/**
 * Sequência de dias a partir das datas de daily_activity (AAAA-MM-DD, fuso de São Paulo).
 * Se hoje ainda não teve atividade mas ontem teve, a sequência continua contando.
 */
export function computeStreak(dates: readonly string[], now: Date): Streak {
  const days = new Set(dates);
  const today = dateSP(now);
  const activeToday = days.has(today);

  let current = 0;
  let start: string | null = null;
  const anchor = activeToday ? today : addDays(today, -1);
  for (let day = anchor; days.has(day); day = addDays(day, -1)) {
    current += 1;
    start = day;
  }

  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of [...days].sort()) {
    run = previous !== null && addDays(previous, 1) === day ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }

  return { current, start, activeToday, longest };
}

/** Maior conquista de sequência já alcançada (7 antes de 3), ou null. */
export function reachedMilestone(current: number): StreakMilestone | null {
  const reached = STREAK_MILESTONES.filter((m) => current >= m);
  return reached.length ? reached[reached.length - 1] : null;
}

/** Simulações concluídas na semana atual (segunda a domingo, São Paulo). */
export function countThisWeek(completedAt: readonly (string | null)[], now: Date): number {
  const monday = weekStartSP(now);
  return completedAt.filter((iso) => iso !== null && dateSP(new Date(iso)) >= monday).length;
}

export type Trend = {
  /** Últimas notas, da mais antiga para a mais recente. */
  points: number[];
  /** Diferença entre a última nota e a primeira de todas (null com menos de 2 simulações). */
  sinceFirst: number | null;
};

/** Dados do gráfico a partir das notas, da mais recente para a mais antiga (como vem do banco). */
export function scoreTrend(scoresNewestFirst: readonly number[], size = CHART_POINTS): Trend {
  const points = scoresNewestFirst.slice(0, size).reverse();
  const n = scoresNewestFirst.length;
  return { points, sinceFirst: n >= 2 ? scoresNewestFirst[0] - scoresNewestFirst[n - 1] : null };
}
