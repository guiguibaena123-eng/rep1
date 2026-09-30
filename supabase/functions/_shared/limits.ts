// Limites dos planos (seção 7 do Prompt 2), sempre aplicados aqui no servidor.

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { AppError } from './http.ts';
import { dateSP, isPremium, nextWeekStartSP, weekStartSP } from './interview-logic.ts';
import { monthStartSP, nextMonthStartSP } from './linkedin-logic.ts';

export const FREE_INTERVIEWS_PER_WEEK = 1;
export const PREMIUM_INTERVIEWS_PER_DAY = 30;
// Mesmos números da função SQL linkedin_usage (migration 20260930000000).
export const FREE_LINKEDIN_PER_MONTH = 1;
export const PREMIUM_LINKEDIN_PER_MONTH = 10;
const CALLS_PER_HOUR = 20;
// O Premium não tem limite semanal; o contador semanal só alimenta a tela de uso.
const NO_LIMIT = 1_000_000;

/**
 * Rate limit simples: no máximo 20 chamadas por hora, por pessoa, em cada função.
 * Conta e registra numa só operação do banco (take_rate_slot): pedidos simultâneos não furam o limite.
 */
export async function checkRateLimit(admin: SupabaseClient, userId: string, fn: string) {
  const { data, error } = await admin.rpc('take_rate_slot', { p_user: userId, p_fn: fn, p_limit: CALLS_PER_HOUR });
  if (error) throw error;
  if (data !== true) {
    throw new AppError('LIMIT_REACHED', 'Muitas tentativas seguidas. Espere um pouco e tente de novo.', { reason: 'rate' });
  }
}

/** Uma vaga reservada num contador (para devolver com releaseUsage se algo falhar). */
export type Reservation = { kind: string; period: string };

/** Reserva 1 vaga no contador SE ainda couber no limite (operação única no banco). */
async function reserve(admin: SupabaseClient, userId: string, kind: string, period: string, limit: number) {
  const { data, error } = await admin.rpc('reserve_usage', { p_user: userId, p_kind: kind, p_period: period, p_limit: limit });
  if (error) throw error;
  return data === true;
}

/** Devolve as vagas reservadas (a simulação/análise não foi entregue). Nunca lança: é chamada no meio de um erro. */
export async function releaseUsage(admin: SupabaseClient, userId: string, reservations: Reservation[]) {
  for (const r of reservations) {
    const { error } = await admin.rpc('release_usage', { p_user: userId, p_kind: r.kind, p_period: r.period });
    if (error) console.error(JSON.stringify({ fn: 'limits', error: 'release_usage' }));
  }
}

export async function loadPremium(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin.from('profiles').select('plan, premium_until').eq('id', userId).single();
  if (error) throw error;
  return isPremium(data);
}

/**
 * Reserva uma simulação ANTES de chamar a IA (se algo falhar depois, devolva com releaseUsage).
 * Grátis: 1 por semana (segunda 00:00, São Paulo). Premium: limite técnico de 30 por dia.
 * O contador semanal sempre sobe (é o que a tela de uso mostra).
 */
export async function reserveInterview(admin: SupabaseClient, userId: string, now = new Date()): Promise<Reservation[]> {
  const premium = await loadPremium(admin, userId);
  const week: Reservation = { kind: 'interview', period: weekStartSP(now) };

  if (premium) {
    const day: Reservation = { kind: 'interview_day', period: dateSP(now) };
    if (!(await reserve(admin, userId, day.kind, day.period, PREMIUM_INTERVIEWS_PER_DAY))) {
      throw new AppError('LIMIT_REACHED', 'Você já treinou bastante hoje. Descanse e volte amanhã.', { reason: 'daily' });
    }
    if (!(await reserve(admin, userId, week.kind, week.period, NO_LIMIT))) {
      await releaseUsage(admin, userId, [day]);
      throw new AppError('INTERNAL', 'Algo deu errado do nosso lado. Tente de novo em alguns segundos.');
    }
    return [day, week];
  }

  if (!(await reserve(admin, userId, week.kind, week.period, FREE_INTERVIEWS_PER_WEEK))) {
    throw new AppError('LIMIT_REACHED', 'Você usou sua simulação grátis desta semana. Ela volta na segunda-feira.', {
      reason: 'weekly',
      resets_at: nextWeekStartSP(now),
    });
  }
  return [week];
}

/**
 * Reserva uma análise do LinkedIn ANTES de chamar a IA (mês começa no dia 1, 00:00, São Paulo).
 * Grátis: 1 resumo por mês. Premium: relatório completo, limite técnico de 10 por mês.
 */
export async function reserveLinkedIn(admin: SupabaseClient, userId: string, now = new Date()) {
  const premium = await loadPremium(admin, userId);
  const reservation: Reservation = { kind: premium ? 'linkedin_full' : 'linkedin_summary', period: monthStartSP(now) };
  const limit = premium ? PREMIUM_LINKEDIN_PER_MONTH : FREE_LINKEDIN_PER_MONTH;

  if (!(await reserve(admin, userId, reservation.kind, reservation.period, limit))) {
    throw new AppError(
      'LIMIT_REACHED',
      premium
        ? 'Você já fez 10 análises neste mês. Elas voltam no dia 1.'
        : 'Você já usou sua análise grátis deste mês. Ela volta no dia 1.',
      { reason: 'monthly', resets_at: nextMonthStartSP(now) },
    );
  }
  return { full: premium, reservation };
}
