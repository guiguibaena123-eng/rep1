import { initials, isPremium } from '../types';

describe('isPremium (mesma regra do servidor)', () => {
  const now = new Date('2026-09-27T12:00:00Z');

  it('gratuito nunca é Premium', () => {
    expect(isPremium({ plan: 'free', premium_until: null }, now)).toBe(false);
  });

  it('Premium sem validade vale para sempre', () => {
    expect(isPremium({ plan: 'premium', premium_until: null }, now)).toBe(true);
  });

  it('Premium vale só até a data de validade', () => {
    expect(isPremium({ plan: 'premium', premium_until: '2026-10-27T00:00:00Z' }, now)).toBe(true);
    expect(isPremium({ plan: 'premium', premium_until: '2026-09-01T00:00:00Z' }, now)).toBe(false);
  });
});

describe('initials', () => {
  it('usa primeira e última palavra', () => {
    expect(initials('Ana Souza')).toBe('AS');
    expect(initials('  maria da silva ')).toBe('MS');
  });

  it('com um nome só, usa as 2 primeiras letras', () => {
    expect(initials('Ana')).toBe('AN');
  });

  it('sem nome, mostra "?"', () => {
    expect(initials(null)).toBe('?');
  });
});
