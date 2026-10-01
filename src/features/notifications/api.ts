import { useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import { nextOffset } from '@/features/explore/logic';
import { supabase } from '@/lib/supabase';

import { settleRead } from './logic';
import { NOTIFICATIONS_PAGE_SIZE, type AppNotification } from './types';

/** Todas as chaves começam com 'notifications': invalidar essa raiz recarrega tudo. */
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (userId?: string) => ['notifications', 'list', userId] as const,
  unread: (userId?: string) => ['notifications', 'unread', userId] as const,
};

/** Lista de notificações, mais recentes primeiro, 20 por página. */
export function useNotifications() {
  const userId = useAuth().session?.user.id;
  return useInfiniteQuery({
    queryKey: notificationKeys.list(userId),
    enabled: !!userId,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase.rpc('notifications_list', {
        p_limit: NOTIFICATIONS_PAGE_SIZE,
        p_offset: pageParam,
      });
      if (error) throw error;
      return (data ?? []) as AppNotification[];
    },
    getNextPageParam: (last, all) => nextOffset(last, all, NOTIFICATIONS_PAGE_SIZE),
  });
}

/** Quantas ainda não foram lidas (número no sino). Atualiza ao voltar para o app. */
export function useUnreadCount() {
  const userId = useAuth().session?.user.id;
  return useQuery({
    queryKey: notificationKeys.unread(userId),
    enabled: !!userId,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('notifications_unread_count');
      if (error) throw error;
      return (data as number | null) ?? 0;
    },
  });
}

/** Ao sair da tela, a lista em cache passa a "lida" (senão reabrir logo depois mostraria o destaque de novo). */
export function useSettleListOnLeave() {
  const queryClient = useQueryClient();
  const userId = useAuth().session?.user.id;
  return useCallback(() => {
    queryClient.setQueryData<InfiniteData<AppNotification[]>>(notificationKeys.list(userId), settleRead);
  }, [queryClient, userId]);
}

/** Marca tudo como lido. Só o número do sino é atualizado; a lista na tela mantém o destaque até sair. */
export function useMarkAllRead() {
  const queryClient = useQueryClient();
  const userId = useAuth().session?.user.id;
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('notifications_mark_read');
      if (error) throw error;
    },
    onSuccess: () => queryClient.setQueryData(notificationKeys.unread(userId), 0),
  });
}
