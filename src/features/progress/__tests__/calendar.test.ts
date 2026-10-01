import {
  dayStatus,
  formatMinutes,
  monthGrid,
  monthSummary,
  sessionMinutes,
  shiftMonth,
  startDayOf,
  timeByDay,
} from '../calendar';

describe('monthGrid', () => {
  it('outubro de 2026 começa numa quinta (segunda a domingo)', () => {
    const grid = monthGrid({ year: 2026, month: 9 });
    expect(grid[0]).toEqual([null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
    expect(grid.every((w) => w.length === 7)).toBe(true);
    expect(grid.flat().filter(Boolean)).toHaveLength(31);
  });

  it('fevereiro de 2027 tem 28 dias', () => {
    expect(monthGrid({ year: 2027, month: 1 }).flat().filter(Boolean)).toHaveLength(28);
  });
});

describe('shiftMonth', () => {
  it('vira o ano nos dois sentidos', () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });
});

describe('dayStatus', () => {
  const active = new Set(['2026-10-03']);
  const today = '2026-10-06';
  const start = '2026-10-02';

  it('classifica cada dia', () => {
    expect(dayStatus('2026-10-03', today, start, active)).toBe('done');
    expect(dayStatus('2026-10-04', today, start, active)).toBe('ice');
    expect(dayStatus('2026-10-02', today, start, active)).toBe('ice');
    expect(dayStatus('2026-10-01', today, start, active)).toBe('before');
    expect(dayStatus('2026-10-06', today, start, active)).toBe('today');
    expect(dayStatus('2026-10-07', today, start, active)).toBe('future');
  });

  it('hoje com atividade é done, nunca gelo', () => {
    expect(dayStatus('2026-10-06', today, start, new Set(['2026-10-06']))).toBe('done');
  });

  it('sem data de início, nada vira gelo', () => {
    expect(dayStatus('2026-10-04', today, null, active)).toBe('before');
  });
});

describe('startDayOf', () => {
  it('usa o mais antigo entre cadastro e primeira atividade', () => {
    expect(startDayOf('2026-10-05T15:00:00Z', ['2026-10-03'])).toBe('2026-10-03');
    expect(startDayOf('2026-09-20T15:00:00Z', ['2026-10-03'])).toBe('2026-09-20');
    expect(startDayOf(null, [])).toBeNull();
  });
});

describe('tempo de simulação', () => {
  const row = (start: string, end: string | null, n = 3) => ({ created_at: start, completed_at: end, num_questions: n });

  it('mede do início ao fim, com mínimo de 1 min', () => {
    expect(sessionMinutes(row('2026-10-01T15:00:00Z', '2026-10-01T15:07:00Z'))).toBe(7);
    expect(sessionMinutes(row('2026-10-01T15:00:00Z', '2026-10-01T15:00:10Z'))).toBe(1);
  });

  it('limita ao dobro do previsto (3 perguntas = 12 min)', () => {
    expect(sessionMinutes(row('2026-10-01T10:00:00Z', '2026-10-01T18:00:00Z'))).toBe(12);
  });

  it('sem hora de fim não conta', () => {
    expect(sessionMinutes(row('2026-10-01T15:00:00Z', null))).toBe(0);
  });

  it('soma por dia de São Paulo (22h50 SP ainda é o mesmo dia)', () => {
    const out = timeByDay([
      row('2026-10-01T14:00:00Z', '2026-10-01T14:05:00Z'),
      row('2026-10-02T01:50:00Z', '2026-10-02T01:55:00Z'),
      row('2026-10-02T15:00:00Z', '2026-10-02T15:04:00Z'),
    ]);
    expect(out['2026-10-01']).toEqual({ minutes: 10, count: 2 });
    expect(out['2026-10-02']).toEqual({ minutes: 4, count: 1 });
  });
});

describe('monthSummary', () => {
  it('conta treinados, gelos e minutos só do mês', () => {
    const active = new Set(['2026-10-02', '2026-10-04']);
    const times = { '2026-10-02': { minutes: 9, count: 1 }, '2026-09-30': { minutes: 50, count: 1 } };
    expect(monthSummary({ year: 2026, month: 9 }, '2026-10-05', '2026-10-01', active, times)).toEqual({
      done: 2,
      ice: 2,
      minutes: 9,
    });
  });
});

describe('formatMinutes', () => {
  it.each([
    [0, '0 min'],
    [45, '45 min'],
    [60, '1h'],
    [80, '1h 20min'],
  ])('%i → %s', (m, text) => {
    expect(formatMinutes(m)).toBe(text);
  });
});
