import { isStripeCheckoutUrl } from '@/features/plan/logic';

import { authLinkAction, parseAuthLink } from '../deepLink';

// jest.mock é "içado" para antes dos imports automaticamente.
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('expo-linking', () => ({ createURL: () => 'pronto://', useLinkingURL: () => null }));

describe('parseAuthLink', () => {
  it('lê o código do link do Supabase (PKCE)', () => {
    const p = parseAuthLink('exp://192.168.0.2:8081/--/?code=0b6f6c1e-3b0a-4c1e-9d59-7a4f2c9e1d11');
    expect(p.code).toBe('0b6f6c1e-3b0a-4c1e-9d59-7a4f2c9e1d11');
    expect(authLinkAction(p)).toBe('code');
  });

  it('lê erros de link vencido', () => {
    const p = parseAuthLink('pronto://?error=access_denied&error_description=Email+link+is+invalid+or+has+expired');
    expect(p.error_description).toBe('Email link is invalid or has expired');
  });

  it('ignora links comuns do app', () => {
    expect(parseAuthLink('pronto://perfil')).toEqual({});
  });

  it('não quebra com link malformado (ignora só o pedaço inválido)', () => {
    expect(() => parseAuthLink('pronto://?access_token=%E0&type=signup')).not.toThrow();
    expect(parseAuthLink('pronto://?access_token=%E0&type=signup')).toEqual({ type: 'signup' });
    expect(parseAuthLink('pronto://?%E0=x')).toEqual({});
  });
});

describe('segurança dos links', () => {
  it('recusa link no formato antigo, com o login dentro (qualquer pessoa podia montar um)', () => {
    const p = parseAuthLink('pronto://#access_token=token-do-golpista&refresh_token=x&type=signup');
    expect(authLinkAction(p)).toBe('error');
  });

  it('recusa código malformado e avisa link vencido', () => {
    expect(authLinkAction(parseAuthLink('pronto://?code=<script>'))).toBe('error');
    expect(authLinkAction(parseAuthLink('pronto://?code='))).toBe('error');
    expect(authLinkAction(parseAuthLink('pronto://?error=access_denied&error_description=expired'))).toBe('error');
  });

  it('ignora links comuns do app', () => {
    expect(authLinkAction(parseAuthLink('pronto://perfil'))).toBe('ignore');
  });

  it('pagamento só abre na Stripe', () => {
    expect(isStripeCheckoutUrl('https://checkout.stripe.com/c/pay/cs_test_123')).toBe(true);
    expect(isStripeCheckoutUrl('http://checkout.stripe.com/c/pay')).toBe(false);
    expect(isStripeCheckoutUrl('https://checkout.stripe.com.golpe.xyz/pay')).toBe(false);
    expect(isStripeCheckoutUrl('https://golpe.xyz/?checkout.stripe.com')).toBe(false);
    expect(isStripeCheckoutUrl('javascript:alert(1)')).toBe(false);
  });
});
