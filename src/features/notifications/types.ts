import type { VerifiedKind } from '@/features/profile/verified';

/** Tipos criados pelo banco (tabela notifications). */
export type NotificationType = 'follow_request' | 'follow_accepted' | 'new_follower';

/** Uma notificação da lista (função notifications_list). Só o básico de quem fez a ação. */
export type AppNotification = {
  id: string;
  type: NotificationType;
  created_at: string;
  is_read: boolean;
  actor_id: string;
  actor_name: string | null;
  actor_username: string | null;
  actor_photo_path: string | null;
  actor_verified: VerifiedKind | null;
};

/**
 * Lembretes calculados no próprio celular (não ficam no banco):
 * simulação em andamento, sequência de dias em risco ou treino do dia.
 */
export type LocalReminder = { kind: 'pending' } | { kind: 'streak'; days: number } | { kind: 'train' };

export const NOTIFICATIONS_PAGE_SIZE = 20;
