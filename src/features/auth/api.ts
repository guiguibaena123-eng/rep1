import { isAuthApiError, type AuthError } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';

import { t } from '@/i18n';
import { ApiError, callFunction } from '@/lib/api';
import { supabase } from '@/lib/supabase';

import { authLinkAction, authRedirectUrl, oauthFlow, parseAuthLink } from './deepLink';
import { emailLanguageData } from './emailLanguage';

/** Resultado de uma ação de conta: ok, ou uma mensagem amigável + um motivo conhecido. */
export type AuthResult =
  | { ok: true }
  | { ok: false; reason: 'credentials' | 'not_confirmed' | 'already_registered' | 'rate_limited' | 'other'; message: string };

export function toResult(error: AuthError | null): AuthResult {
  if (!error) return { ok: true };
  const code = isAuthApiError(error) ? error.code : undefined;
  // O envio grátis de e-mails do Supabase tem limite por HORA (não por minuto).
  if (code === 'over_email_send_rate_limit') return { ok: false, reason: 'rate_limited', message: t.auth.emailLimit };
  if (code === 'invalid_credentials') return { ok: false, reason: 'credentials', message: t.auth.wrongCredentials };
  // Senha fora da política do Supabase (ex.: sem número, ou numa lista de senhas vazadas).
  if (code === 'weak_password') return { ok: false, reason: 'other', message: t.auth.passwordWeak };
  if (code === 'email_not_confirmed') return { ok: false, reason: 'not_confirmed', message: t.auth.emailNotConfirmed };
  if (code === 'user_already_exists' || code === 'email_exists')
    return { ok: false, reason: 'already_registered', message: t.auth.alreadyRegistered };
  if (error.status === 429 || code === 'over_request_rate_limit')
    return { ok: false, reason: 'rate_limited', message: t.auth.tooManyAttempts };
  return { ok: false, reason: 'other', message: t.auth.generic };
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    // O link de confirmação abre o app e já entra na conta. O idioma escolhe a língua do e-mail.
    options: { emailRedirectTo: authRedirectUrl(), data: emailLanguageData() },
  });
  if (error) return toResult(error);
  // Com confirmação de e-mail ligada, o Supabase não dá erro para e-mail já cadastrado
  // (para não revelar quem tem conta), mas devolve o usuário sem "identities".
  if (data.user && data.user.identities?.length === 0) {
    return { ok: false, reason: 'already_registered', message: t.auth.alreadyRegistered };
  }
  return { ok: true };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return toResult(error);
}

/**
 * "Continuar com Google": abre o login do Google num navegador seguro dentro do app
 * e, na volta, troca o código de uso único (PKCE) pela sessão. Serve para entrar e para criar conta.
 * cancelled = a pessoa fechou o navegador (não é erro: nada a mostrar).
 */
export async function signInWithGoogle(): Promise<AuthResult | { ok: false; reason: 'cancelled' }> {
  const redirectTo = authRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) return { ok: false, reason: 'other', message: t.auth.googleFailed };

  // Enquanto o navegador está aberto, o leitor de links do app não mexe no código (evita usar o mesmo código duas vezes).
  oauthFlow.active = true;
  try {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return { ok: false, reason: 'cancelled' };

    const params = parseAuthLink(result.url);
    if (authLinkAction(params) !== 'code') return { ok: false, reason: 'other', message: t.auth.googleFailed };
    const code = params.code!;
    // O leitor de links já usou este código (Android): a sessão vem de lá.
    if (!oauthFlow.codes.has(code)) {
      oauthFlow.codes.add(code);
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
        code,
        params.sb_flow_id ? { flowId: params.sb_flow_id } : undefined,
      );
      if (!exchangeError) return { ok: true };
    }
    const { data: current } = await supabase.auth.getSession();
    return current.session ? { ok: true } : { ok: false, reason: 'other', message: t.auth.googleFailed };
  } finally {
    oauthFlow.active = false;
  }
}

export async function resendConfirmation(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: { emailRedirectTo: authRedirectUrl() },
  });
  return toResult(error);
}

/**
 * Envia o e-mail com o link "criar senha nova" (o link abre o app).
 * A resposta para a tela é SEMPRE genérica, para não revelar se o e-mail existe.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: authRedirectUrl() }).catch(() => {});
}

/** Troca a senha da pessoa logada (usado depois de abrir o link de "criar senha nova"). */
export async function updatePassword(password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error?.code === 'same_password') return { ok: false, reason: 'other', message: t.newPassword.samePassword };
  return toResult(error);
}

export async function signOut() {
  // scope 'local': encerra só neste aparelho e funciona mesmo sem internet.
  await supabase.auth.signOut({ scope: 'local' });
}

/** Apaga a conta no servidor e encerra a sessão local. */
export async function deleteAccount() {
  try {
    await callFunction<{ deleted: boolean }>('delete-account');
  } catch (err) {
    // Já apagada numa tentativa anterior: segue para sair.
    if (!(err instanceof ApiError && err.code === 'UNAUTHENTICATED')) throw err;
  }
  await signOut();
}
