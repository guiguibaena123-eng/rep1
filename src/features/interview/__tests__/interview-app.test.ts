import { shortDate } from '@/lib/dates';

import { canSendAnswer, levelFromGoal } from '../types';

describe('levelFromGoal', () => {
  it('usa o próprio objetivo quando é um nível', () => {
    expect(levelFromGoal('jovem_aprendiz')).toBe('jovem_aprendiz');
    expect(levelFromGoal('estagio')).toBe('estagio');
    expect(levelFromGoal('primeiro_emprego')).toBe('primeiro_emprego');
  });
  it('"Novo emprego" treina como júnior', () => {
    expect(levelFromGoal('novo_emprego')).toBe('junior');
  });
  it('sem objetivo, sugere primeiro emprego', () => {
    expect(levelFromGoal(null)).toBe('primeiro_emprego');
  });
});

describe('canSendAnswer', () => {
  it('exige 20 caracteres, sem contar espaços nas pontas', () => {
    expect(canSendAnswer('curta')).toBe(false);
    expect(canSendAnswer(`   ${'a'.repeat(19)}   `)).toBe(false);
    expect(canSendAnswer('a'.repeat(20))).toBe(true);
  });
});

describe('shortDate', () => {
  it('mostra dia e mês no fuso de São Paulo', () => {
    expect(shortDate('2026-09-24T15:00:00Z')).toBe('24 set');
    // 01/10 às 01:00 UTC ainda é 30/09 em São Paulo.
    expect(shortDate('2026-10-01T01:00:00Z')).toBe('30 set');
  });
});
