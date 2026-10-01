import { MINUTES_PER_QUESTION } from '@/features/interview/types';
import { dateSP } from '@/lib/dates';

export type DayStatus = 'done' | 'ice' | 'today' | 'future' | 'before';

export type Month = { year: number; month: number };

/** Mês (0–11) de uma data AAAA-MM-DD. */
export function monthOf(isoDate: string): Month {
  const [year, m] = isoDate.split('-').map(Number);
  return { year, month: m - 1 };
}

export function shiftMonth({ year, month }: Month, delta: number): Month {
  const index = year * 12 + month + delta;
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Semanas do mês, de segunda a domingo; null = célula vazia (dias de outro mês). */
export function monthGrid({ year, month }: Month): (string | null)[][] {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const total = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: total }, (_, i) => `${year}-${pad(month + 1)}-${pad(i + 1)}`),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

/**
 * Situação de um dia:
 * - done: teve atividade (simulação, dica ou análise do LinkedIn, igual à sequência);
 * - ice: dia que já passou, sem atividade, desde que a pessoa começou (cubo de gelo);
 * - today: hoje ainda sem atividade (ainda dá tempo, então não vira gelo);
 * - before / future: fora do período (antes de começar ou ainda não chegou).
 */
export function dayStatus(day: string, today: string, startDay: string | null, active: ReadonlySet<string>): DayStatus {
  if (active.has(day)) return 'done';
  if (day > today) return 'future';
  if (day === today) return 'today';
  if (!startDay || day < startDay) return 'before';
  return 'ice';
}

/** Primeiro dia que conta para o calendário: o mais antigo entre o cadastro e a primeira atividade. */
export function startDayOf(createdAt: string | null | undefined, activeDays: readonly string[]): string | null {
  const days = [...activeDays];
  if (createdAt) days.push(dateSP(new Date(createdAt)));
  return days.length > 0 ? days.reduce((a, b) => (a < b ? a : b)) : null;
}

export type SimulationRow = { created_at: string; completed_at: string | null; num_questions: number };
export type DayTime = { minutes: number; count: number };

/**
 * Minutos de uma simulação: do início ao fim, no mínimo 1 e no máximo o dobro do tempo previsto
 * (quem começa e responde horas depois não deve inflar o tempo). Sem hora de fim, não conta.
 */
export function sessionMinutes(row: SimulationRow): number {
  if (!row.completed_at) return 0;
  const elapsed = (new Date(row.completed_at).getTime() - new Date(row.created_at).getTime()) / 60000;
  const cap = row.num_questions * MINUTES_PER_QUESTION * 2;
  return Math.max(1, Math.min(Math.round(elapsed), cap));
}

/** Tempo e quantidade de simulações concluídas por dia (AAAA-MM-DD em São Paulo). */
export function timeByDay(rows: readonly SimulationRow[]): Record<string, DayTime> {
  const out: Record<string, DayTime> = {};
  for (const row of rows) {
    if (!row.completed_at) continue;
    const day = dateSP(new Date(row.completed_at));
    const entry = (out[day] ??= { minutes: 0, count: 0 });
    entry.minutes += sessionMinutes(row);
    entry.count += 1;
  }
  return out;
}

/** Totais de um mês: dias treinados, dias sem treino (gelo) e minutos de simulação. */
export function monthSummary(
  month: Month,
  today: string,
  startDay: string | null,
  active: ReadonlySet<string>,
  times: Record<string, DayTime>,
) {
  let done = 0;
  let ice = 0;
  let minutes = 0;
  for (const day of monthGrid(month).flat()) {
    if (!day) continue;
    const status = dayStatus(day, today, startDay, active);
    if (status === 'done') done += 1;
    if (status === 'ice') ice += 1;
    minutes += times[day]?.minutes ?? 0;
  }
  return { done, ice, minutes };
}

/** 45 → "45 min"; 80 → "1h 20min"; 120 → "2h". */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}
