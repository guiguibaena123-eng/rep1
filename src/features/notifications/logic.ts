import type { Streak } from '@/features/progress/logic';
import { t } from '@/i18n';

import type { LocalReminder } from './types';

/**
 * Lembretes de hoje para a aba Notificações.
 * - Simulação em andamento: sempre o primeiro.
 * - Ainda sem atividade hoje: sequência em risco (se tem dias seguidos) ou "hora de treinar".
 * - Conta oficial do Siwki não treina: nenhum lembrete.
 * Sem os dados carregados (streak null), não inventa lembrete.
 */
export function localReminders({
  hasPending,
  streak,
  official,
}: {
  hasPending: boolean;
  streak: Pick<Streak, 'current' | 'activeToday'> | null;
  official: boolean;
}): LocalReminder[] {
  if (official) return [];
  const list: LocalReminder[] = [];
  if (hasPending) list.push({ kind: 'pending' });
  if (streak && !streak.activeToday) {
    list.push(streak.current > 0 ? { kind: 'streak', days: streak.current } : { kind: 'train' });
  }
  return list;
}

/** "agora", "há 5 min", "há 2 h", "há 3 d"; depois de uma semana, a data curta. */
export function timeAgo(iso: string, now: Date) {
  const a = t.notifications.ago;
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return a.now;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return a.minutes(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return a.hours(hours);
  const days = Math.floor(hours / 24);
  if (days < 7) return a.days(days);
  return new Date(iso).toLocaleDateString();
}
