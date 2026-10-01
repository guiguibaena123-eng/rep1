import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { callFunction } from '@/lib/api';
import { supabase } from '@/lib/supabase';

import { detailsToUpdate } from './details';
import { clearPending, readPending, writePending } from './offline';
import type { Profile, ProfileDetails, ProfileUpdate } from './types';

export const profileKey = (userId: string | undefined) => ['profile', userId] as const;

/**
 * Perfil da pessoa logada. Atualiza sozinho ao voltar para o app (plano liberado no painel).
 * Se houver uma edição feita sem internet ainda não enviada, ela aparece por cima do que veio do banco.
 */
export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: profileKey(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId!).single();
      if (error) throw error;
      const pending = await readPending(userId!);
      return (pending ? { ...data, ...pending } : data) as Profile;
    },
  });
}

export function useUpdateProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (changes: ProfileUpdate) => {
      const { data, error } = await supabase.from('profiles').update(changes).eq('id', userId!).select('*').single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (profile) => queryClient.setQueryData(profileKey(userId), profile),
  });
}

export async function isOffline() {
  const net = await NetInfo.fetch();
  return net.isConnected === false || net.isInternetReachable === false;
}

/**
 * Salva a T19. Sem internet: guarda no celular, mostra na hora e devolve 'offline'
 * (useProfileSync envia quando a conexão voltar).
 */
export function useSaveDetails() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (details: ProfileDetails): Promise<'online' | 'offline'> => {
      const changes = detailsToUpdate(details);
      if (await isOffline()) {
        await writePending(userId!, changes);
        queryClient.setQueryData<Profile>(profileKey(userId), (old) => (old ? { ...old, ...changes } : old));
        return 'offline';
      }
      const { data, error } = await supabase.from('profiles').update(changes).eq('id', userId!).select('*').single();
      if (error) throw isUsernameTaken(error) ? new UsernameTakenError() : error;
      await clearPending(userId!);
      queryClient.setQueryData(profileKey(userId), data as Profile);
      return 'online';
    },
  });
}

/** Outra pessoa já usa esse @ (o banco recusou por ser repetido). */
export class UsernameTakenError extends Error {}

export function isUsernameTaken(error: { code?: string; message?: string }) {
  return error.code === '23505' && (error.message ?? '').includes('username');
}

/** "Esse @ está livre?" (null enquanto não dá para saber, ex.: sem internet). */
export async function checkUsername(username: string): Promise<boolean | null> {
  const { data, error } = await supabase.rpc('username_available', { p_username: username });
  if (error) return null;
  return data === true;
}

/** Envia a edição guardada sem internet assim que a conexão voltar (montado no layout raiz). */
export function useProfileSync() {
  const userId = useAuth().session?.user.id;
  const net = useNetInfo();
  const online = net.isConnected === true && net.isInternetReachable !== false;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !online) return;
    let cancelled = false;
    (async () => {
      let pending: Partial<ProfileDetails> | null = await readPending(userId);
      if (!pending || cancelled) return;
      let { data, error } = await supabase.from('profiles').update(pending).eq('id', userId).select('*').single();
      // Alguém pegou o @ enquanto a pessoa estava sem internet: salva o resto e mantém o @ antigo.
      if (error && isUsernameTaken(error) && !cancelled) {
        const { username: _taken, ...rest } = pending;
        pending = rest;
        ({ data, error } = await supabase.from('profiles').update(pending).eq('id', userId).select('*').single());
      }
      if (error || cancelled) return; // tenta de novo na próxima vez que a conexão mudar
      await clearPending(userId);
      queryClient.setQueryData(profileKey(userId), data as Profile);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, online, queryClient]);
}

/** Pontos fortes ("O que foi bem") das últimas simulações: destacam competências na T18. */
export function useStrengths() {
  const userId = useAuth().session?.user.id;
  return useQuery({
    queryKey: ['profile', 'strengths', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_feedback')
        .select('report')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []).flatMap((row) => {
        const strengths = (row.report as { strengths?: unknown } | null)?.strengths;
        return Array.isArray(strengths) ? strengths.filter((s): s is string => typeof s === 'string') : [];
      });
    },
  });
}

export type BioInput = Pick<ProfileDetails, 'name' | 'goal' | 'area' | 'experiences' | 'education'> & { age: number | null };

/** "Me ajude a escrever": a IA sugere uma bio de 3 frases. Nada é salvo no servidor. */
export function useSuggestBio() {
  return useMutation({
    mutationFn: (input: BioInput) => callFunction<{ bio: string }>('suggest-bio', input),
  });
}
