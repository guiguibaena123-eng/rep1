import { localReminders, timeAgo } from '../logic';

describe('localReminders (lembretes de hoje)', () => {
  const idle = { current: 0, activeToday: false };

  it('simulação em andamento vem primeiro', () => {
    const list = localReminders({
      hasPending: true,
      streak: { current: 4, activeToday: false },
      official: false,
    });
    expect(list).toEqual([{ kind: 'pending' }, { kind: 'streak', days: 4 }]);
  });

  it('sem treino hoje e sem sequência: hora de treinar', () => {
    expect(localReminders({ hasPending: false, streak: idle, official: false })).toEqual([{ kind: 'train' }]);
  });

  it('já treinou hoje: sem lembrete de treino', () => {
    expect(
      localReminders({
        hasPending: false,
        streak: { current: 5, activeToday: true },
        official: false,
      }),
    ).toEqual([]);
  });

  it('dados ainda não carregados: não inventa lembrete', () => {
    expect(localReminders({ hasPending: false, streak: null, official: false })).toEqual([]);
  });

  it('conta oficial não recebe lembretes', () => {
    expect(localReminders({ hasPending: true, streak: idle, official: true })).toEqual([]);
  });
});

describe('timeAgo', () => {
  const now = new Date('2026-10-17T12:00:00Z');
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  it('escolhe a unidade certa', () => {
    expect(timeAgo(ago(10_000), now)).toMatch(/\S/);
    expect(timeAgo(ago(5 * 60_000), now)).toContain('5');
    expect(timeAgo(ago(3 * 3_600_000), now)).toContain('3');
    expect(timeAgo(ago(2 * 86_400_000), now)).toContain('2');
  });

  it('data no futuro (relógio adiantado) vira "agora"', () => {
    expect(timeAgo(new Date(now.getTime() + 60_000).toISOString(), now)).toBe(timeAgo(ago(0), now));
  });
});
