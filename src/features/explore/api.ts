import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

import { applyFollow, nextOffset, type ExploreParams } from './logic';
import { EXPLORE_PAGE_SIZE, type ExplorePerson, type FollowCounts, type FollowKind, type PublicProfile, type ReportReason } from './types';

/** Todas as chaves do Explorar começam com 'explore': invalidar essa raiz recarrega tudo. */
export const exploreKeys = {
  all: ['explore'] as const,
  list: (userId: string | undefined, params: ExploreParams) => ['explore', 'list', userId, params] as const,
  similar: (userId: string | undefined) => ['explore', 'similar', userId] as const,
  profile: (userId: string | undefined, id: string) => ['explore', 'profile', userId, id] as const,
  counts: (userId: string | undefined, id: string) => ['explore', 'counts', userId, id] as const,
  follows: (userId: string | undefined, id: string, kind: FollowKind) => ['explore', 'follows', userId, id, kind] as const,
};

/** Código do erro que as funções do banco devolvem (PROFILE_UNAVAILABLE = P0002, LIMIT_REACHED = 54000). */
export function errorCode(err: unknown) {
  return (err as { code?: string } | null)?.code ?? null;
}

/** "Pessoas para conhecer": 20 por página, carrega mais ao chegar no fim da lista. */
export function useExplorePeople(params: ExploreParams) {
  const userId = useAuth().session?.user.id;
  return useInfiniteQuery({
    queryKey: exploreKeys.list(userId, params),
    enabled: !!userId,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase.rpc('explore_profiles', {
        ...params,
        p_limit: EXPLORE_PAGE_SIZE,
        p_offset: pageParam,
      });
      if (error) throw error;
      return (data ?? []) as ExplorePerson[];
    },
    getNextPageParam: (last, all) => nextOffset(last, all, EXPLORE_PAGE_SIZE),
  });
}

/** "Com objetivos parecidos": mesma área e mesmo objetivo (até 10). */
export function useSimilarPeople() {
  const userId = useAuth().session?.user.id;
  return useQuery({
    queryKey: exploreKeys.similar(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('similar_profiles', { p_limit: 10 });
      if (error) throw error;
      return (data ?? []) as ExplorePerson[];
    },
  });
}

/** Perfil de outra pessoa. null = privado, bloqueado ou apagado ("não está disponível"). */
export function usePublicProfile(id: string) {
  const userId = useAuth().session?.user.id;
  return useQuery({
    queryKey: exploreKeys.profile(userId, id),
    enabled: !!userId && !!id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('public_profile', { p_id: id });
      if (error) throw error;
      const row = (data as PublicProfile[] | null)?.[0];
      return row ?? null;
    },
  });
}

/**
 * Seguir / deixar de seguir. Muda na hora em todas as telas do Explorar (lista, carrossel e perfil)
 * e desfaz se o banco recusar.
 */
export function useFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, on }: { id: string; on: boolean }) => {
      const { error } = await supabase.rpc(on ? 'follow_user' : 'unfollow_user', { p_target: id });
      if (error) throw error;
    },
    onMutate: async ({ id, on }) => {
      await queryClient.cancelQueries({ queryKey: exploreKeys.all });
      const before = queryClient.getQueriesData({ queryKey: exploreKeys.all });
      queryClient.setQueriesData({ queryKey: exploreKeys.all }, (data: unknown) => applyFollow(data, id, on));
      return { before };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.before.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    // Os números ("Seguindo" do próprio perfil e "Seguidores" de quem foi seguido) vêm do banco.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['explore', 'counts'] }),
  });
}

/** Seguidores e seguindo de um perfil (o próprio ou um visível). null = não dá para ver. */
export function useFollowCounts(id: string | undefined) {
  const userId = useAuth().session?.user.id;
  return useQuery({
    queryKey: exploreKeys.counts(userId, id ?? ''),
    enabled: !!userId && !!id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('follow_counts', { p_id: id });
      if (error) throw error;
      return ((data as FollowCounts[] | null)?.[0] ?? null) as FollowCounts | null;
    },
  });
}

/** Lista "Seguidores" ou "Seguindo": 20 por página, só perfis que a pessoa logada pode ver. */
export function useFollowList(id: string, kind: FollowKind) {
  const userId = useAuth().session?.user.id;
  return useInfiniteQuery({
    queryKey: exploreKeys.follows(userId, id, kind),
    enabled: !!userId && !!id,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase.rpc('follow_list', {
        p_id: id,
        p_kind: kind,
        p_limit: EXPLORE_PAGE_SIZE,
        p_offset: pageParam,
      });
      if (error) throw error;
      return (data ?? []) as ExplorePerson[];
    },
    getNextPageParam: (last, all) => nextOffset(last, all, EXPLORE_PAGE_SIZE),
  });
}

/** Bloquear (silencioso). Depois disso a pessoa some de todas as listas. */
export function useBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('block_user', { p_target: id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exploreKeys.all }),
  });
}

export function useReport() {
  return useMutation({
    mutationFn: async ({ id, reason, detail }: { id: string; reason: ReportReason; detail: string }) => {
      const { error } = await supabase.rpc('report_user', {
        p_target: id,
        p_reason: reason,
        p_detail: detail.trim() || null,
      });
      if (error) throw error;
    },
  });
}
