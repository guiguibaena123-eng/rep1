import { addDays, dateSP, weekDatesSP, weekStartSP } from '@/lib/dates';

import { computeStreak, countThisWeek, reachedMilestone, resetsTomorrow, scoreTrend, weeklyGoal } from '../logic';

// Quarta-feira, 30/09/2026, 12:00 em São Paulo (15:00 UTC).
const wed = new Date('2026-09-30T15:00:00Z');

describe('datas no fuso de São Paulo', () => {
  it('usa o dia de São Paulo, não o de UTC', () => {
    // 01/10 às 01:00 UTC ainda é 30/09 às 22:00 em São Paulo.
    expect(dateSP(new Date('2026-10-01T01:00:00Z'))).toBe('2026-09-30');
    expect(dateSP(new Date('2026-10-01T03:00:00Z'))).toBe('2026-10-01');
  });

  it('soma dias atravessando o mês', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('semana começa na segunda-feira', () => {
    expect(weekStartSP(wed)).toBe('2026-09-28');
    // Domingo 04/10 às 23:00 em SP (05/10 02:00 UTC) ainda é a mesma semana.
    expect(weekStartSP(new Date('2026-10-05T02:00:00Z'))).toBe('2026-09-28');
    // Segunda 05/10 às 00:00 em SP já vira a semana.
    expect(weekStartSP(new Date('2026-10-05T03:00:00Z'))).toBe('2026-10-05');
    expect(weekDatesSP(wed)).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
  });
});

describe('computeStreak (sequência de dias)', () => {
  it('sem atividade: zero', () => {
    expect(computeStreak([], wed)).toEqual({ current: 0, start: null, activeToday: false, longest: 0 });
  });

  it('conta os dias seguidos até hoje', () => {
    const s = computeStreak(['2026-09-28', '2026-09-29', '2026-09-30'], wed);
    expect(s).toMatchObject({ current: 3, start: '2026-09-28', activeToday: true });
  });

  it('hoje sem atividade mas ontem sim: a sequência continua', () => {
    const s = computeStreak(['2026-09-28', '2026-09-29'], wed);
    expect(s).toMatchObject({ current: 2, start: '2026-09-28', activeToday: false });
  });

  it('pulou ontem: a sequência zera', () => {
    expect(computeStreak(['2026-09-27', '2026-09-28'], wed).current).toBe(0);
  });

  it('usa o fuso de São Paulo para decidir o que é "hoje"', () => {
    // 22:00 de 30/09 em SP (01/10 em UTC): hoje ainda é 30/09.
    const lateNight = new Date('2026-10-01T01:00:00Z');
    expect(computeStreak(['2026-09-30'], lateNight)).toMatchObject({ current: 1, activeToday: true });
  });

  it('guarda a maior sequência, mesmo que já tenha acabado', () => {
    const s = computeStreak(['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-30'], wed);
    expect(s.current).toBe(1);
    expect(s.longest).toBe(4);
  });

  it('ignora datas repetidas e fora de ordem', () => {
    expect(computeStreak(['2026-09-30', '2026-09-29', '2026-09-30'], wed)).toMatchObject({ current: 2, longest: 2 });
  });
});

describe('reachedMilestone (conquistas)', () => {
  it('só a partir de 3 dias; 7 vence 3', () => {
    expect(reachedMilestone(2)).toBeNull();
    expect(reachedMilestone(3)).toBe(3);
    expect(reachedMilestone(6)).toBe(3);
    expect(reachedMilestone(7)).toBe(7);
    expect(reachedMilestone(20)).toBe(7);
  });
});

describe('countThisWeek (meta semanal)', () => {
  it('conta só a partir de segunda 00:00 em São Paulo', () => {
    const done = [
      '2026-09-30T12:00:00Z', // quarta
      '2026-09-28T03:00:00Z', // segunda 00:00 SP: conta
      '2026-09-28T02:59:00Z', // domingo 23:59 SP: semana passada
      null,
    ];
    expect(countThisWeek(done, wed)).toBe(2);
  });
});

describe('weeklyGoal (meta conforme o plano)', () => {
  it('Premium: 3 simulações', () => {
    expect(weeklyGoal(true, 2, 5)).toEqual({ done: 2, total: 3, sims: { done: 2, goal: 3 }, tips: null });
    expect(weeklyGoal(true, 5, 0).done).toBe(3);
  });

  it('grátis: 1 simulação + 2 dicas, e dá para completar sem Premium', () => {
    expect(weeklyGoal(false, 0, 0)).toEqual({ done: 0, total: 3, sims: { done: 0, goal: 1 }, tips: { done: 0, goal: 2 } });
    expect(weeklyGoal(false, 1, 1).done).toBe(2);
    // Dicas a mais não compensam a simulação que falta.
    expect(weeklyGoal(false, 0, 5)).toMatchObject({ done: 2, tips: { done: 2, goal: 2 } });
    expect(weeklyGoal(false, 1, 2).done).toBe(3);
  });
});

describe('resetsTomorrow (simulação grátis volta)', () => {
  const nextMonday = '2026-10-05T03:00:00Z'; // segunda 00:00 em São Paulo
  it('domingo: volta amanhã; quarta: não', () => {
    expect(resetsTomorrow(nextMonday, new Date('2026-10-04T15:00:00Z'))).toBe(true);
    expect(resetsTomorrow(nextMonday, wed)).toBe(false);
  });
});

describe('scoreTrend (gráfico de evolução)', () => {
  it('mostra as últimas notas em ordem de tempo e compara com a primeira de todas', () => {
    const newestFirst = [70, 68, 64, 66, 62, 50];
    expect(scoreTrend(newestFirst)).toEqual({ points: [62, 66, 64, 68, 70], sinceFirst: 20 });
  });

  it('uma simulação só: sem comparação', () => {
    expect(scoreTrend([55])).toEqual({ points: [55], sinceFirst: null });
    expect(scoreTrend([])).toEqual({ points: [], sinceFirst: null });
  });
});
