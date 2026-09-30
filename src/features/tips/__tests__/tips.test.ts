import {
  dayOfYearSP,
  filterTips,
  nextTip,
  normalize,
  progressSets,
  sortTips,
  splitBold,
  tipOfTheDay,
  trackProgress,
} from '../logic';
import { parseTipBody, type Tip, type Track } from '../types';

const tracks: Track[] = [
  { id: 'trB', slug: 'curriculo', title: 'Currículo do zero', description: '', sort_order: 2 },
  { id: 'trA', slug: 'entrevista', title: 'Entrevista sem medo', description: '', sort_order: 1 },
];

const tip = (id: string, over: Partial<Tip> = {}): Tip => ({
  id,
  slug: id,
  title: `Dica ${id}`,
  category: 'entrevista',
  read_minutes: 2,
  is_premium: false,
  track_id: null,
  track_order: null,
  goals: [],
  areas: [],
  for_nervous: false,
  ...over,
});

const a1 = tip('a1', { title: 'Como responder “fale sobre você”', track_id: 'trA', track_order: 1 });
const a2 = tip('a2', { title: 'Perguntas para o fim', track_id: 'trA', track_order: 2, is_premium: true });
const b1 = tip('b1', { title: 'Currículo de uma página', category: 'curriculo', track_id: 'trB', track_order: 1 });
const b2 = tip('b2', { title: 'Título do LinkedIn', category: 'linkedin', track_id: 'trB', track_order: 2 });
const solo = tip('solo', { title: 'Nervosismo', category: 'entrevista' });

const sorted = sortTips([solo, b2, a2, b1, a1], tracks);

describe('ordem e filtros da T13', () => {
  it('ordena pela trilha e pela posição na trilha; sem trilha vai para o fim', () => {
    expect(sorted.map((x) => x.id)).toEqual(['a1', 'a2', 'b1', 'b2', 'solo']);
  });

  it('busca ignora acento e maiúsculas', () => {
    expect(normalize('  Currículo ')).toBe('curriculo');
    expect(filterTips(sorted, 'all', 'CURRICULO', new Set()).map((x) => x.id)).toEqual(['b1']);
    expect(filterTips(sorted, 'all', 'voce', new Set()).map((x) => x.id)).toEqual(['a1']);
  });

  it('filtra por categoria e por salvas', () => {
    expect(filterTips(sorted, 'entrevista', '', new Set()).map((x) => x.id)).toEqual(['a1', 'a2', 'solo']);
    expect(filterTips(sorted, 'saved', '', new Set(['b2', 'solo'])).map((x) => x.id)).toEqual(['b2', 'solo']);
    expect(filterTips(sorted, 'saved', '', new Set())).toEqual([]);
  });
});

describe('"Para você"', () => {
  const vendas = tip('vendas', { title: 'Vaga de vendas', areas: ['vendas'] });
  const estagio = tip('estagio', { title: 'Estágio', goals: ['estagio'] });
  const nervoso = tip('nervoso', { title: 'Nervosismo', for_nervous: true });
  const geral = tip('geral', { title: 'Geral' });
  const list = [geral, nervoso, estagio, vendas];

  it('área vem primeiro, depois objetivo, depois nervosismo', () => {
    const profile = { area: 'vendas', goal: 'estagio', nervousness: 1 } as const;
    expect(filterTips(list, 'forYou', '', new Set(), profile).map((x) => x.id)).toEqual(['vendas', 'estagio', 'nervoso']);
  });

  it('quem é tranquilo(a) não recebe as dicas de nervosismo', () => {
    const profile = { area: 'vendas', goal: 'estagio', nervousness: 4 } as const;
    expect(filterTips(list, 'forYou', '', new Set(), profile).map((x) => x.id)).toEqual(['vendas', 'estagio']);
  });

  it('sem perfil ou sem combinação: lista vazia (dica geral nunca entra)', () => {
    expect(filterTips(list, 'forYou', '', new Set(), null)).toEqual([]);
    const other = { area: 'saude', goal: 'novo_emprego', nervousness: 5 } as const;
    expect(filterTips(list, 'forYou', '', new Set(), other)).toEqual([]);
  });

  it('a busca também vale dentro do "Para você"', () => {
    const profile = { area: 'vendas', goal: 'estagio', nervousness: 1 } as const;
    expect(filterTips(list, 'forYou', 'estagio', new Set(), profile).map((x) => x.id)).toEqual(['estagio']);
  });
});

describe('trilhas', () => {
  it('progresso = lidas / total, e a próxima é a primeira não lida', () => {
    expect(trackProgress(sorted, 'trA', new Set())).toEqual({ read: 0, total: 2, next: a1 });
    expect(trackProgress(sorted, 'trA', new Set(['a1']))).toEqual({ read: 1, total: 2, next: a2 });
  });

  it('trilha concluída volta para a primeira dica', () => {
    expect(trackProgress(sorted, 'trA', new Set(['a1', 'a2']))).toEqual({ read: 2, total: 2, next: a1 });
  });
});

describe('próxima dica (T14)', () => {
  it('segue a ordem da trilha', () => {
    expect(nextTip(a1, sorted)).toBe(a2);
    expect(nextTip(b1, sorted)).toBe(b2);
  });

  it('última da trilha: próxima da mesma categoria', () => {
    // a2 é a última de trA; na categoria entrevista, depois dela vem "solo".
    expect(nextTip(a2, sorted)).toBe(solo);
  });

  it('sem próxima na trilha nem na categoria: null', () => {
    expect(nextTip(b2, sorted)).toBeNull();
    expect(nextTip(solo, sorted)).toBeNull();
  });
});

describe('dica do dia (T5)', () => {
  it('conta o dia do ano no fuso de São Paulo', () => {
    expect(dayOfYearSP(new Date('2026-01-01T12:00:00Z'))).toBe(1);
    // 01/01 às 02:00 UTC ainda é 31/12 em São Paulo.
    expect(dayOfYearSP(new Date('2026-01-01T02:00:00Z'))).toBe(365);
  });

  it('é a mesma o dia todo e muda no dia seguinte', () => {
    const morning = tipOfTheDay(sorted, true, new Date('2026-09-30T11:00:00Z'));
    const night = tipOfTheDay(sorted, true, new Date('2026-10-01T02:00:00Z'));
    const tomorrow = tipOfTheDay(sorted, true, new Date('2026-10-01T12:00:00Z'));
    expect(morning).toBe(night);
    expect(tomorrow).not.toBe(morning);
  });

  it('plano grátis nunca recebe dica Premium', () => {
    for (let day = 0; day < 30; day++) {
      const when = new Date(Date.UTC(2026, 0, 1 + day, 15));
      expect(tipOfTheDay(sorted, false, when)?.is_premium).toBe(false);
    }
  });

  it('sem dicas: null', () => {
    expect(tipOfTheDay([], true, new Date())).toBeNull();
    expect(tipOfTheDay([a2], false, new Date())).toBeNull();
  });
});

describe('progresso e texto', () => {
  it('separa lidas e salvas', () => {
    const { read, saved } = progressSets([
      { tip_id: 'a1', read_at: '2026-09-30T12:00:00Z', favorited: false, helpful: null },
      { tip_id: 'b1', read_at: null, favorited: true, helpful: true },
    ]);
    expect([...read]).toEqual(['a1']);
    expect([...saved]).toEqual(['b1']);
  });

  it('negrito com **', () => {
    expect(splitBold('**Quem você é:** nome e idade.')).toEqual([
      { text: 'Quem você é:', bold: true },
      { text: ' nome e idade.', bold: false },
    ]);
    expect(splitBold('sem negrito')).toEqual([{ text: 'sem negrito', bold: false }]);
  });

  it('lê os blocos e ignora os que vierem com formato errado', () => {
    expect(
      parseTipBody([
        { type: 'p', text: 'Oi' },
        { type: 'list', ordered: true, items: ['um', 'dois'] },
        { type: 'video', url: 'x' },
        { type: 'warning' },
        { type: 'example', text: 'Ex.' },
      ]),
    ).toEqual([
      { type: 'p', text: 'Oi' },
      { type: 'list', ordered: true, items: ['um', 'dois'] },
      { type: 'example', text: 'Ex.' },
    ]);
    expect(parseTipBody(null)).toEqual([]);
  });

  it('fontes: aceita só links https', () => {
    const ok = { type: 'sources', items: [{ title: 'gov.br', url: 'https://www.gov.br/x' }] };
    expect(parseTipBody([ok])).toEqual([ok]);
    expect(parseTipBody([{ type: 'sources', items: [{ title: 'x', url: 'javascript:alert(1)' }] }])).toEqual([]);
    expect(parseTipBody([{ type: 'sources', items: [] }])).toEqual([]);
  });
});
