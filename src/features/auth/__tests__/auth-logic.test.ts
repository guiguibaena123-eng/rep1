import { AuthApiError } from '@supabase/supabase-js';

import { toResult } from '../api';
import { LOCK_MS, MAX_ATTEMPTS, secondsLeft, useLoginAttempts } from '../attempts';
import { signInSchema, signUpSchema } from '../validation';

describe('validação de Criar conta', () => {
  it('aceita e-mail válido, senha com 8+ caracteres (letras e números) e termos aceitos', () => {
    expect(signUpSchema.safeParse({ email: 'ana@gmail.com', password: 'senha123', accepted: true }).success).toBe(true);
  });

  it('recusa senha só com números ou só com letras (mesma regra do Supabase)', () => {
    const onlyDigits = signUpSchema.safeParse({ email: 'ana@gmail.com', password: '12345678', accepted: true });
    expect(onlyDigits.success).toBe(false);
    expect(onlyDigits.error?.issues[0].message).toBe('Use letras e números na senha');
    expect(signUpSchema.safeParse({ email: 'ana@gmail.com', password: 'abcdefgh', accepted: true }).success).toBe(false);
  });

  it('senha fraca recusada pelo servidor vira mensagem clara', () => {
    const result = toResult(new AuthApiError('Password is known to be weak', 422, 'weak_password'));
    if (!result.ok) expect(result.message).toBe('Use letras e números na senha');
  });

  it('recusa e-mail sem domínio completo (mesma regra do design)', () => {
    const r = signUpSchema.safeParse({ email: 'ana.souza@gmail', password: '12345678', accepted: true });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe('Esse e-mail não parece certo');
  });

  it('recusa senha curta e termos não aceitos', () => {
    expect(signUpSchema.safeParse({ email: 'ana@gmail.com', password: '1234567', accepted: true }).success).toBe(false);
    expect(signUpSchema.safeParse({ email: 'ana@gmail.com', password: 'senha123', accepted: false }).success).toBe(false);
  });
});

describe('validação de Entrar', () => {
  it('não exige 8 caracteres (contas antigas), só uma senha', () => {
    expect(signInSchema.safeParse({ email: 'ana@gmail.com', password: 'x' }).success).toBe(true);
    expect(signInSchema.safeParse({ email: 'ana@gmail.com', password: '' }).success).toBe(false);
  });
});

describe('mensagens de erro do cadastro', () => {
  it('limite de e-mails pede para esperar 1 hora (e não 1 minuto)', () => {
    const err = new AuthApiError('Email rate limit exceeded', 429, 'over_email_send_rate_limit');
    const result = toResult(err);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/1 hora/);
  });

  it('muitas requisições seguidas pede 1 minuto', () => {
    const result = toResult(new AuthApiError('Too many requests', 429, 'over_request_rate_limit'));
    if (!result.ok) expect(result.message).toMatch(/1 minuto/);
  });
});

describe('tentativas de login', () => {
  beforeEach(() => useLoginAttempts.getState().reset());

  it('bloqueia por 1 minuto depois de 5 erros seguidos', () => {
    const before = Date.now();
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) useLoginAttempts.getState().registerFailure();
    expect(useLoginAttempts.getState().lockedUntil).toBeNull();

    useLoginAttempts.getState().registerFailure();
    const lockedUntil = useLoginAttempts.getState().lockedUntil!;
    expect(lockedUntil).toBeGreaterThanOrEqual(before + LOCK_MS);
    expect(secondsLeft(lockedUntil, lockedUntil - 30_000)).toBe(30);
    expect(secondsLeft(lockedUntil, lockedUntil + 1)).toBe(0);
  });
});
