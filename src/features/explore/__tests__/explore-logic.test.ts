import { AREAS } from '@/features/profile/types';
import { t } from '@/i18n';

import {
  applyFollow,
  areasMatching,
  canFilterNear,
  exploreParams,
  filterChips,
  nextOffset,
  placeLine,
  shortLine,
  toggleFilter,
  topSkills,
} from '../logic';
import type { ExplorePerson, PublicProfile } from '../types';

const firstArea = AREAS.find((a) => a !== 'outra')!;

const person = (over: Partial<ExplorePerson> = {}): ExplorePerson => ({
  id: 'p1',
  name: 'Bia',
  username: 'bia',
  headline: null,
  city: null,
  area: null,
  goal: null,
  skills: [],
  photo_path: null,
  is_following: false,
  ...over,
});

describe('filterChips', () => {
  it('sem área nem objetivo: só Perto de mim, Estágio e Jovem aprendiz', () => {
    expect(filterChips(null).map((c) => c.key)).toEqual(['near', 'estagio', 'jovem_aprendiz']);
  });

  it('com área e objetivo: chips da pessoa vêm primeiro', () => {
    const keys = filterChips({ area: firstArea, goal: 'primeiro_emprego' }).map((c) => c.key);
    expect(keys).toEqual(['area', 'goal', 'near', 'estagio', 'jovem_aprendiz']);
  });

  it('área "outra" não vira chip, e objetivo Estágio não repete chip', () => {
    const keys = filterChips({ area: 'outra', goal: 'estagio' }).map((c) => c.key);
    expect(keys).toEqual(['near', 'estagio', 'jovem_aprendiz']);
  });
});

describe('areasMatching', () => {
  it('busca curta demais não filtra área', () => {
    expect(areasMatching('a')).toEqual([]);
  });

  it('acha a área pelo começo do nome, sem diferenciar maiúsculas', () => {
    const label = t.options.area[firstArea];
    expect(areasMatching(label.slice(0, 4).toUpperCase())).toContain(firstArea);
  });

  it('nunca devolve "outra"', () => {
    expect(areasMatching(t.options.area.outra)).not.toContain('outra');
  });
});

describe('exploreParams', () => {
  const profile = { area: firstArea, goal: 'primeiro_emprego' as const };

  it('sem busca e sem filtro: tudo nulo', () => {
    expect(exploreParams('   ', [], profile)).toEqual({
      p_query: null,
      p_query_areas: null,
      p_areas: null,
      p_goals: null,
      p_near: false,
    });
  });

  it('limita a busca a 60 caracteres', () => {
    expect(exploreParams('x'.repeat(100), [], profile).p_query).toHaveLength(60);
  });

  it('objetivos juntos entram em "OU" e sem repetir', () => {
    const p = exploreParams('', ['goal', 'estagio', 'jovem_aprendiz'], profile);
    expect(p.p_goals).toEqual(['primeiro_emprego', 'estagio', 'jovem_aprendiz']);
  });

  it('chip de área usa a área do perfil; "outra" é ignorada', () => {
    expect(exploreParams('', ['area'], profile).p_areas).toEqual([firstArea]);
    expect(exploreParams('', ['area'], { area: 'outra', goal: null }).p_areas).toBeNull();
  });

  it('chip sem dado no perfil não filtra', () => {
    const p = exploreParams('', ['area', 'goal'], null);
    expect(p.p_areas).toBeNull();
    expect(p.p_goals).toBeNull();
  });

  it('busca com @ vai inteira para o banco e não procura áreas', () => {
    const label = t.options.area[firstArea];
    expect(exploreParams(`@${label}`, [], profile)).toMatchObject({ p_query: `@${label}`, p_query_areas: null });
    expect(exploreParams(label, [], profile).p_query_areas).toContain(firstArea);
  });

  it('Perto de mim liga p_near', () => {
    expect(exploreParams('', ['near'], profile).p_near).toBe(true);
  });
});

describe('canFilterNear e toggleFilter', () => {
  it('precisa de cidade não vazia', () => {
    expect(canFilterNear(null)).toBe(false);
    expect(canFilterNear({ city: '  ' })).toBe(false);
    expect(canFilterNear({ city: 'Guarulhos, SP' })).toBe(true);
  });

  it('liga e desliga sem mexer na lista original', () => {
    const before = ['area'] as const;
    expect(toggleFilter(before, 'near')).toEqual(['area', 'near']);
    expect(toggleFilter(['area', 'near'], 'area')).toEqual(['near']);
    expect(before).toEqual(['area']);
  });
});

describe('linhas do card', () => {
  it('shortLine e placeLine pulam o que falta', () => {
    expect(shortLine(person())).toBe('');
    expect(shortLine(person({ goal: 'estagio', area: 'outra' }))).toBe(t.options.goal.estagio);
    expect(placeLine(person({ city: ' Guarulhos, SP ', area: firstArea }))).toBe(`Guarulhos, SP · ${t.options.area[firstArea]}`);
  });

  it('topSkills devolve até 2 nomes', () => {
    const skills = ['A', 'B', 'C'].map((name) => ({ name, type: 'comportamental' as const }));
    expect(topSkills(person({ skills }))).toEqual(['A', 'B']);
  });
});

describe('applyFollow (atualização otimista)', () => {
  it('lista simples (carrossel)', () => {
    const out = applyFollow([person({ id: 'p1' }), person({ id: 'p2' })], 'p2', true) as ExplorePerson[];
    expect(out.map((p) => p.is_following)).toEqual([false, true]);
  });

  it('lista paginada', () => {
    const data = { pages: [[person({ id: 'p1' })], [person({ id: 'p2' })]], pageParams: [0, 1] };
    const out = applyFollow(data, 'p2', true) as typeof data;
    expect(out.pages[1][0].is_following).toBe(true);
    expect(out.pages[0][0].is_following).toBe(false);
  });

  it('perfil aberto ajusta seguidores e nunca passa de zero', () => {
    const profile = { id: 'p1', is_following: true, followers: 0 } as PublicProfile;
    expect((applyFollow(profile, 'p1', false) as PublicProfile).followers).toBe(0);
    const other = { id: 'p1', is_following: false, followers: 4 } as PublicProfile;
    expect((applyFollow(other, 'p1', true) as PublicProfile).followers).toBe(5);
  });

  it('perfil de outra pessoa e cache vazio ficam como estão', () => {
    const profile = { id: 'p9', is_following: false, followers: 1 } as PublicProfile;
    expect(applyFollow(profile, 'p1', true)).toBe(profile);
    expect(applyFollow(undefined, 'p1', true)).toBeUndefined();
  });
});

describe('nextOffset', () => {
  it('página incompleta encerra; cheia pede a próxima pela soma', () => {
    expect(nextOffset([1, 2], [[1, 2]], 20)).toBeUndefined();
    const full = Array.from({ length: 20 }, (_, i) => i);
    expect(nextOffset(full, [full, full], 20)).toBe(40);
  });
});
