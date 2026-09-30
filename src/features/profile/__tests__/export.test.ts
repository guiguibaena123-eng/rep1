import { buildExport, type ExportParts } from '../export';

// O Jest "sobe" estes mocks para antes do import acima.
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: {} }));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));

describe('buildExport', () => {
  const parts: ExportParts = {
    profile: { id: 'u1', name: 'Ana', plan: 'free' },
    simulacoes: [{ id: 's1' }],
    respostas: [{ id: 'a1' }],
    feedbacks: [],
    relatorios_linkedin: [],
    dias_com_atividade: [{ activity_date: '2026-09-28' }],
    dicas: [{ read_at: null, favorited: true }],
    seguindo: [{ followed_id: 'u2' }],
    bloqueados: [],
  };

  it('junta perfil, e-mail e todas as seções', () => {
    const out = buildExport(parts, 'ana@exemplo.com', new Date('2026-09-28T12:00:00Z'));
    expect(out.app).toBe('Siwki');
    expect(out.gerado_em).toBe('2026-09-28T12:00:00.000Z');
    expect(out.conta).toEqual({ email: 'ana@exemplo.com', id: 'u1', name: 'Ana', plan: 'free' });
    expect(Object.keys(out)).toEqual(
      expect.arrayContaining([
        'simulacoes',
        'respostas',
        'feedbacks',
        'relatorios_linkedin',
        'dias_com_atividade',
        'dicas',
        'seguindo',
        'bloqueados',
      ]),
    );
    expect(out).not.toHaveProperty('profile');
  });

  it('vira JSON válido', () => {
    const out = buildExport(parts, undefined, new Date());
    expect(JSON.parse(JSON.stringify(out)).conta.email).toBeNull();
  });
});
