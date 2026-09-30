import { t } from '@/i18n';

import { DEFAULT_REMINDER, formatTime, parseTime, stepTime, weeklyPlan } from '../logic';

describe('parseTime / formatTime', () => {
  it('lê a coluna time do banco', () => {
    expect(parseTime('07:45:00')).toEqual({ hour: 7, minute: 45 });
    expect(parseTime('19:30')).toEqual({ hour: 19, minute: 30 });
  });
  it('valor vazio ou inválido vira o padrão (19:00)', () => {
    expect(parseTime(null)).toEqual(DEFAULT_REMINDER);
    expect(parseTime('abc')).toEqual(DEFAULT_REMINDER);
    expect(parseTime('25:00')).toEqual(DEFAULT_REMINDER);
  });
  it('formata com dois dígitos', () => {
    expect(formatTime({ hour: 7, minute: 5 })).toBe('07:05');
  });
});

describe('stepTime', () => {
  it('hora dá a volta no relógio', () => {
    expect(stepTime({ hour: 23, minute: 0 }, 'hour', 1)).toEqual({ hour: 0, minute: 0 });
    expect(stepTime({ hour: 0, minute: 0 }, 'hour', -1)).toEqual({ hour: 23, minute: 0 });
  });
  it('minuto anda de 15 em 15 e dá a volta sem mudar a hora', () => {
    expect(stepTime({ hour: 8, minute: 45 }, 'minute', 1)).toEqual({ hour: 8, minute: 0 });
    expect(stepTime({ hour: 8, minute: 0 }, 'minute', -1)).toEqual({ hour: 8, minute: 45 });
  });
  it('minuto fora da grade é arredondado antes de andar', () => {
    expect(stepTime({ hour: 8, minute: 7 }, 'minute', 1)).toEqual({ hour: 8, minute: 15 });
  });
});

describe('weeklyPlan', () => {
  it('um lembrete por dia (1 = domingo … 7 = sábado), cada um com mensagem diferente', () => {
    const plan = weeklyPlan({ hour: 19, minute: 0 }, t.reminders.messages);
    expect(plan.map((p) => p.weekday)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(new Set(plan.map((p) => p.body)).size).toBe(7);
    expect(plan.every((p) => p.hour === 19 && p.minute === 0)).toBe(true);
  });
  it('as mensagens são curtas (cabem na notificação)', () => {
    expect(t.reminders.messages).toHaveLength(7);
    for (const m of t.reminders.messages) expect(m.length).toBeLessThanOrEqual(110);
  });
});
