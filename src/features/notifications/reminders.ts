import { useAuth } from '@/features/auth/AuthProvider';
import { usePendingSession } from '@/features/interview/api';
import { OFFICIAL_USER_ID } from '@/features/profile/verified';
import { useActivityDates } from '@/features/progress/api';
import { usePreferences } from '@/features/preferences/store';
import { computeStreak } from '@/features/progress/logic';
import { dateSP } from '@/lib/dates';

import { localReminders, reminderKey, unseenReminders } from './logic';
import type { LocalReminder } from './types';

/** Lembretes de hoje (calculados no celular): simulação em andamento, sequência em risco ou treino do dia. */
export function useTodayReminders(): LocalReminder[] {
  const userId = useAuth().session?.user.id;
  const pending = usePendingSession();
  const activity = useActivityDates();
  // "Agora" = hora da última leitura dos dias ativos (mesma regra da Início); antes da resposta, sem lembrete.
  const updatedAt = activity.dataUpdatedAt || activity.errorUpdatedAt;
  const streak = activity.data && updatedAt ? computeStreak(activity.data, new Date(updatedAt)) : null;
  return localReminders({
    hasPending: !!pending.data,
    streak,
    official: userId === OFFICIAL_USER_ID,
  });
}

/** Lembretes de hoje que ainda não foram vistos (número do sino) e como marcá-los como vistos. */
export function useReminderBadge(reminders: LocalReminder[]) {
  const userId = useAuth().session?.user.id;
  const seen = usePreferences((s) => s.seenReminders);
  const markSeen = usePreferences((s) => s.markRemindersSeen);
  const day = dateSP(new Date());
  return {
    unseen: unseenReminders(reminders, seen, userId, day).length,
    markSeen: () => markSeen(reminders.map((r) => reminderKey(userId, day, r))),
  };
}
