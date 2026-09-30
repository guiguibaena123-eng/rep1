import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/api';
import { isPremium } from '@/features/profile/types';
import { progressKeys } from '@/features/progress/api';
import { getLanguage, type Lang } from '@/i18n';
import { supabase } from '@/lib/supabase';

import { sortTips } from './logic';
import { parseTipBody, TIP_COLUMNS, type Tip, type TipProgress, type Track } from './types';

/** Todas as chaves de dicas começam com 'tips': invalidar essa raiz recarrega tudo. */
export const tipsKeys = {
  all: ['tips'] as const,
  // Cada idioma tem as suas dicas: trocar de idioma busca a lista certa.
  catalog: (lang: Lang) => ['tips', 'catalog', lang] as const,
  progress: (userId?: string) => ['tips', 'progress', userId] as const,
  // O plano entra na chave: ao virar Premium, o texto bloqueado é buscado de novo.
  body: (id: string, premium: boolean) => ['tips', 'body', id, premium] as const,
};

export type TipsCatalog = { tips: Tip[]; tracks: Track[] };

/** Lista de dicas (sem o texto) + trilhas do idioma do app. É igual para todo mundo: fica 10 min no cache. */
export function useTipsCatalog() {
  const userId = useAuth().session?.user.id;
  const lang = getLanguage();
  return useQuery({
    queryKey: tipsKeys.catalog(lang),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<TipsCatalog> => {
      const [tipsRes, tracksRes] = await Promise.all([
        supabase.from('tips').select(TIP_COLUMNS).eq('language', lang),
        supabase.from('tracks').select('id, slug, title, description, sort_order').eq('language', lang).order('sort_order'),
      ]);
      if (tipsRes.error) throw tipsRes.error;
      if (tracksRes.error) throw tracksRes.error;
      const tracks = tracksRes.data as Track[];
      return { tips: sortTips(tipsRes.data as Tip[], tracks), tracks };
    },
  });
}

/** Lidas, salvas e votos da pessoa logada. */
export function useTipProgress() {
  const userId = useAuth().session?.user.id;
  return useQuery({
    queryKey: tipsKeys.progress(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('tip_progress').select('tip_id, read_at, favorited, helpful');
      if (error) throw error;
      return data as TipProgress[];
    },
  });
}

/** O plano atual (a regra de verdade está no banco; aqui é só para mostrar cadeados). */
export function useIsPremium() {
  return isPremium(useProfile().data);
}

/** Texto da dica (T14). null = dica Premium e a pessoa não é Premium (o banco não manda). */
export function useTipBody(id: string) {
  const premium = useIsPremium();
  return useQuery({
    queryKey: tipsKeys.body(id, premium),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('tip_body', { p_tip: id });
      if (error) throw error;
      return data == null ? null : parseTipBody(data);
    },
  });
}

/** Troca (ou cria) a linha de progresso de uma dica no cache, para a tela responder na hora. */
function useProgressCache() {
  const queryClient = useQueryClient();
  const userId = useAuth().session?.user.id;
  const key = tipsKeys.progress(userId);

  const patch = (tipId: string, change: Partial<TipProgress>) => {
    queryClient.setQueryData<TipProgress[]>(key, (old = []) => {
      const exists = old.some((row) => row.tip_id === tipId);
      if (exists) return old.map((row) => (row.tip_id === tipId ? { ...row, ...change } : row));
      return [...old, { tip_id: tipId, read_at: null, favorited: false, helpful: null, ...change }];
    });
  };

  const snapshot = () => queryClient.getQueryData<TipProgress[]>(key);
  const restore = (rows: TipProgress[] | undefined) => queryClient.setQueryData(key, rows);
  const cancel = () => queryClient.cancelQueries({ queryKey: key });

  return { patch, snapshot, restore, cancel };
}

/** "Marcar como lida": grava read_at e o dia ativo (sequência) numa função do banco. */
export function useMarkTipRead() {
  const queryClient = useQueryClient();
  const cache = useProgressCache();
  return useMutation({
    mutationFn: async (tipId: string) => {
      const { data, error } = await supabase.rpc('mark_tip_read', { p_tip: tipId });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (readAt, tipId) => {
      cache.patch(tipId, { read_at: readAt });
      queryClient.invalidateQueries({ queryKey: progressKeys.all });
    },
  });
}

/** Salvar / tirar dos salvos. Muda na hora e desfaz se o banco recusar. */
export function useSetFavorite() {
  const cache = useProgressCache();
  return useMutation({
    mutationFn: async ({ tipId, on }: { tipId: string; on: boolean }) => {
      const { error } = await supabase.rpc('set_tip_favorite', { p_tip: tipId, p_on: on });
      if (error) throw error;
    },
    onMutate: async ({ tipId, on }) => {
      await cache.cancel();
      const before = cache.snapshot();
      cache.patch(tipId, { favorited: on });
      return { before };
    },
    onError: (_err, _vars, ctx) => cache.restore(ctx?.before),
  });
}

/** 👍 / 👎 (ou tirar o voto com null). Muda na hora e desfaz se o banco recusar. */
export function useSetHelpful() {
  const cache = useProgressCache();
  return useMutation({
    mutationFn: async ({ tipId, helpful }: { tipId: string; helpful: boolean | null }) => {
      const { error } = await supabase.rpc('set_tip_helpful', { p_tip: tipId, p_helpful: helpful });
      if (error) throw error;
    },
    onMutate: async ({ tipId, helpful }) => {
      await cache.cancel();
      const before = cache.snapshot();
      cache.patch(tipId, { helpful });
      return { before };
    },
    onError: (_err, _vars, ctx) => cache.restore(ctx?.before),
  });
}
