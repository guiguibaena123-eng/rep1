import { useAuth } from '@/features/auth/AuthProvider';
import { usePendingSession } from '@/features/interview/api';
import { OFFICIAL_USER_ID } from '@/features/profile/verified';
import { useActivityDates } from '@/features/progress/api';
import { computeStreak } from '@/features/progress/logic';

import { localReminders } from './logic';
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
