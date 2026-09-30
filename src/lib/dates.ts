/** Datas mostradas no app, sempre no fuso de São Paulo, no formato do idioma da pessoa. */

import { t } from '@/i18n';

/** Brasil sem horário de verão desde 2019: São Paulo é sempre UTC-3. */
const SP_OFFSET_MS = -3 * 60 * 60 * 1000;

/** "2026-09-24T15:00:00Z" → "24 set" (pt) / "Sep 24" (en), no fuso de São Paulo. */
export function shortDate(iso: string) {
  const sp = new Date(new Date(iso).getTime() + SP_OFFSET_MS);
  return t.dates.short(sp.getUTCDate(), t.dates.months[sp.getUTCMonth()]);
}

/** Dia (AAAA-MM-DD) em São Paulo. Mesma regra do servidor (daily_activity.activity_date). */
export function dateSP(when: Date): string {
  return new Date(when.getTime() + SP_OFFSET_MS).toISOString().slice(0, 10);
}

/** Soma (ou subtrai) dias de uma data AAAA-MM-DD. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Segunda-feira da semana atual em São Paulo (a semana vira na segunda 00:00). */
export function weekStartSP(now: Date): string {
  const today = dateSP(now);
  const [y, m, d] = today.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = domingo
  return addDays(today, -((weekday + 6) % 7));
}

/** Os 7 dias da semana atual, de segunda a domingo. */
export function weekDatesSP(now: Date): string[] {
  const monday = weekStartSP(now);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
