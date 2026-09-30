import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { useDrafts } from '@/features/interview/draft';
import { clearPending } from '@/features/profile/offline';
import { cancelReminders } from '@/features/reminders/notifications';
import { supabase } from '@/lib/supabase';

import { useAuthDeepLinks } from './deepLink';

type AuthState = {
  session: Session | null;
  /** true enquanto ainda lemos a sessão salva no aparelho. */
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, loading: true });
  const queryClient = useQueryClient();
  // Quem estava logado (no SIGNED_OUT a sessão já vem vazia).
  const lastUserId = useRef<string | null>(null);
  // Links dos e-mails (confirmar cadastro, criar senha nova) abrem o app já logado.
  useAuthDeepLinks();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        lastUserId.current = data.session?.user.id ?? null;
        setState({ session: data.session, loading: false });
      })
      .catch(() => setState({ session: null, loading: false }));

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState({ session, loading: false });
      if (session) lastUserId.current = session.user.id;
      // Ao sair, apaga do aparelho tudo o que era da conta, para a próxima pessoa não ver nada.
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
        useDrafts.setState({ drafts: {} });
        // Lembretes são da conta: sem conta, sem aviso neste aparelho.
        cancelReminders().catch(() => {});
        // Edição do perfil ainda não enviada (tinha bio, links…) e fotos/capa guardadas em cache.
        if (lastUserId.current) clearPending(lastUserId.current).catch(() => {});
        lastUserId.current = null;
        Image.clearMemoryCache().catch(() => {});
        Image.clearDiskCache().catch(() => {});
      }
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
