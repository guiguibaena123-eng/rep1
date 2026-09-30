import * as Linking from 'expo-linking';
import { useEffect, useRef } from 'react';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

/**
 * Endereço para onde os links dos e-mails (confirmar cadastro, criar senha nova) levam.
 * No Expo Go vira exp://IP:8081/--/ ; no app instalado, pronto:// .
 * Precisa estar liberado em Authentication → URL Configuration (supabase/config.toml).
 */
export function authRedirectUrl() {
  return Linking.createURL('/');
}

export type AuthLinkParams = {
  /** Código de uso único do PKCE (?code=...). */
  code?: string;
  /** Id do pedido (só vem quando o Supabase o anexa ao link). */
  sb_flow_id?: string;
  error_description?: string;
  /** Formato ANTIGO (tokens no link). Não é mais aceito: qualquer pessoa podia montar um. */
  access_token?: string;
};

/** decodeURIComponent que não quebra com "%" inválido (ex.: link malicioso "?access_token=%E0"). */
function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/** Lê os dados que o Supabase coloca no link (depois do # ou do ?). Pedaços malformados são ignorados. */
export function parseAuthLink(url: string): AuthLinkParams {
  const out: Record<string, string> = {};
  const parts = [url.split('#')[1], url.split('?')[1]?.split('#')[0]].filter(Boolean) as string[];
  for (const part of parts) {
    for (const pair of part.split('&')) {
      const [k, v = ''] = pair.split('=');
      const key = k ? safeDecode(k) : null;
      const value = safeDecode(v.replace(/\+/g, ' '));
      if (key && value !== null) out[key] = value;
    }
  }
  return out;
}

const CODE = /^[A-Za-z0-9_-]{8,128}$/;

/**
 * O que fazer com um link aberto no app:
 * - 'code': link de e-mail (PKCE) → trocar o código pela sessão;
 * - 'error': link vencido/inválido (ou no formato antigo, com tokens) → avisar;
 * - 'ignore': link comum do app.
 */
export function authLinkAction(p: AuthLinkParams): 'code' | 'error' | 'ignore' {
  if (p.error_description || p.access_token) return 'error';
  if (p.code !== undefined) return CODE.test(p.code) ? 'code' : 'error';
  return 'ignore';
}

/**
 * true enquanto o login com Google está aberto: a volta (pronto://?code=...) é tratada por
 * signInWithGoogle. No Android ela também chega como link comum, e aqui é ignorada.
 */
export const oauthFlow = { active: false, codes: new Set<string>() };

/** Motivo do aviso: link vencido/usado, ou aberto num aparelho diferente do que pediu o e-mail. */
export type LinkError = 'expired' | 'other_device';

type RecoveryState = {
  /** true depois de abrir o link "criar senha nova": o app mostra a tela de nova senha. */
  active: boolean;
  /** Erro de um link vencido/inválido, para a tela de login mostrar. */
  linkError: LinkError | null;
  setActive: (active: boolean) => void;
  setLinkError: (error: LinkError | null) => void;
};

export const useAuthLinkState = create<RecoveryState>((set) => ({
  active: false,
  linkError: null,
  setActive: (active) => set({ active }),
  setLinkError: (linkError) => set({ linkError }),
}));

/**
 * Quando o app é aberto por um link de e-mail, troca o código do link pela sessão (PKCE).
 * O código só funciona no aparelho que pediu o e-mail, então um link montado por outra
 * pessoa nunca coloca ninguém numa conta alheia.
 * - Confirmação do cadastro: a pessoa entra direto na conta.
 * - Senha nova: entra e o app mostra a tela "Criar senha nova".
 */
export function useAuthDeepLinks() {
  const url = Linking.useLinkingURL();
  const handled = useRef<string | null>(null);

  // Link de "criar senha nova": a biblioteca avisa com PASSWORD_RECOVERY ao trocar o código.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') useAuthLinkState.getState().setActive(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!url || handled.current === url) return;
    const params = parseAuthLink(url);
    const action = authLinkAction(params);
    if (action === 'ignore') return;
    handled.current = url;
    if (oauthFlow.active || (params.code && oauthFlow.codes.has(params.code))) return;
    if (params.code) oauthFlow.codes.add(params.code);

    const { setLinkError } = useAuthLinkState.getState();
    if (action === 'error') {
      setLinkError('expired');
      return;
    }
    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        params.code!,
        params.sb_flow_id ? { flowId: params.sb_flow_id } : undefined,
      );
      // Sem o segredo deste aparelho: o e-mail foi pedido em outro celular (ou o app foi reinstalado).
      if (error?.name === 'AuthPKCECodeVerifierMissingError') setLinkError('other_device');
      else if (error) setLinkError('expired');
    })();
  }, [url]);
}
