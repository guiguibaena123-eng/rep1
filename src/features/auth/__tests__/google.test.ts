import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

import { signInWithGoogle } from '../api';
import { oauthFlow } from '../deepLink';

// jest.mock é "içado" para antes dos imports automaticamente.
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      exchangeCodeForSession: jest.fn(),
      getSession: jest.fn(),
    },
  },
}));
jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn() }));
jest.mock('expo-linking', () => ({ createURL: () => 'pronto:///', useLinkingURL: () => null }));

const auth = supabase.auth as unknown as Record<'signInWithOAuth' | 'exchangeCodeForSession' | 'getSession', jest.Mock>;
const openAuth = WebBrowser.openAuthSessionAsync as jest.Mock;
const CODE = '0b6f6c1e-3b0a-4c1e-9d59-7a4f2c9e1d11';

describe('Continuar com Google', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    oauthFlow.codes.clear();
    auth.signInWithOAuth.mockResolvedValue({ data: { url: 'https://supabase.co/auth/v1/authorize?provider=google' }, error: null });
    auth.exchangeCodeForSession.mockResolvedValue({ data: {}, error: null });
    auth.getSession.mockResolvedValue({ data: { session: null } });
  });

  it('pede o link ao Supabase sem abrir o navegador sozinho, com volta para o app', async () => {
    openAuth.mockResolvedValue({ type: 'cancel' });
    await signInWithGoogle();
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'pronto:///', skipBrowserRedirect: true },
    });
    expect(openAuth).toHaveBeenCalledWith('https://supabase.co/auth/v1/authorize?provider=google', 'pronto:///');
  });

  it('pessoa fechou o navegador: não é erro', async () => {
    openAuth.mockResolvedValue({ type: 'cancel' });
    expect(await signInWithGoogle()).toEqual({ ok: false, reason: 'cancelled' });
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(oauthFlow.active).toBe(false);
  });

  it('volta com o código: troca pela sessão (PKCE) e entra', async () => {
    openAuth.mockResolvedValue({ type: 'success', url: `pronto:///?code=${CODE}` });
    expect(await signInWithGoogle()).toEqual({ ok: true });
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith(CODE, undefined);
  });

  it('código já usado pelo leitor de links (Android): não usa de novo e segue com a sessão', async () => {
    oauthFlow.codes.add(CODE);
    auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'a' } } } });
    openAuth.mockResolvedValue({ type: 'success', url: `pronto:///?code=${CODE}` });
    expect(await signInWithGoogle()).toEqual({ ok: true });
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('volta com erro ou sem código: mensagem amigável', async () => {
    openAuth.mockResolvedValue({ type: 'success', url: 'pronto:///?error=access_denied&error_description=denied' });
    const r = await signInWithGoogle();
    expect(r.ok).toBe(false);
    if (!r.ok && r.reason !== 'cancelled') expect(r.message).toMatch(/Google/);
  });
});
