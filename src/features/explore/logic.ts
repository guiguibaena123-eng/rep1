import type { InfiniteData } from '@tanstack/react-query';

import { AREAS, type Area, type Goal, type Profile } from '@/features/profile/types';
import { normalize } from '@/features/tips/logic';
import { t } from '@/i18n';

import type { ExploreFilter, ExplorePerson, PublicProfile } from './types';

export type FilterChip = { key: ExploreFilter; label: string };

/**
 * Chips do Explorar, na ordem do design: área da pessoa, objetivo da pessoa, Perto de mim,
 * Estágio, Jovem aprendiz. Sem área (ou "Outra") não tem chip de área; objetivo que já é
 * Estágio ou Jovem aprendiz não repete chip.
 */
export function filterChips(profile: Pick<Profile, 'area' | 'goal'> | null | undefined): FilterChip[] {
  const chips: FilterChip[] = [];
  if (profile?.area && profile.area !== 'outra') chips.push({ key: 'area', label: t.options.area[profile.area] });
  if (profile?.goal && profile.goal !== 'estagio' && profile.goal !== 'jovem_aprendiz') {
    chips.push({ key: 'goal', label: t.options.goal[profile.goal] });
  }
  chips.push({ key: 'near', label: t.explore.near });
  chips.push({ key: 'estagio', label: t.options.goal.estagio });
  chips.push({ key: 'jovem_aprendiz', label: t.options.goal.jovem_aprendiz });
  return chips;
}

/** Áreas cujo nome (no idioma do app) contém a busca: "atend" acha Atendimento, "sales" acha Vendas. */
export function areasMatching(query: string): Area[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  return AREAS.filter((a) => a !== 'outra' && normalize(t.options.area[a]).includes(q));
}

export type ExploreParams = {
  p_query: string | null;
  p_query_areas: Area[] | null;
  p_areas: Area[] | null;
  p_goals: Goal[] | null;
  p_near: boolean;
};

/** Filtros e busca → parâmetros da função explore_profiles. Objetivos juntos em "OU". */
export function exploreParams(
  query: string,
  selected: readonly ExploreFilter[],
  profile: Pick<Profile, 'area' | 'goal'> | null | undefined,
): ExploreParams {
  const q = query.trim().slice(0, 60);
  const goals = new Set<Goal>();
  if (selected.includes('goal') && profile?.goal) goals.add(profile.goal);
  if (selected.includes('estagio')) goals.add('estagio');
  if (selected.includes('jovem_aprendiz')) goals.add('jovem_aprendiz');
  const area = selected.includes('area') && profile?.area && profile.area !== 'outra' ? profile.area : null;
  // "@ana" procura só pelo @ (o banco trata); sem @, a busca também acha áreas pelo nome.
  const queryAreas = q && !q.startsWith('@') ? areasMatching(q) : [];
  return {
    p_query: q || null,
    p_query_areas: queryAreas.length > 0 ? queryAreas : null,
    p_areas: area ? [area] : null,
    p_goals: goals.size > 0 ? [...goals] : null,
    p_near: selected.includes('near'),
  };
}

/** "Perto de mim" precisa da cidade no próprio perfil. */
export function canFilterNear(profile: Pick<Profile, 'city'> | null | undefined) {
  return !!profile?.city?.trim();
}

/** Liga/desliga um chip. */
export function toggleFilter(selected: readonly ExploreFilter[], key: ExploreFilter): ExploreFilter[] {
  return selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
}

/** Linha curta do card do carrossel: "Primeiro emprego · Atendimento". */
export function shortLine(p: Pick<ExplorePerson, 'goal' | 'area'>) {
  return [p.goal ? t.options.goal[p.goal] : null, p.area && p.area !== 'outra' ? t.options.area[p.area] : null]
    .filter(Boolean)
    .join(' · ');
}

/** "Guarulhos, SP · Atendimento" (o que tiver). */
export function placeLine(p: Pick<ExplorePerson, 'city' | 'area'>) {
  return [p.city?.trim() || null, p.area ? t.options.area[p.area] : null].filter(Boolean).join(' · ');
}

/** Até 2 competências na lista. */
export function topSkills(p: Pick<ExplorePerson, 'skills'>, max = 2) {
  return (p.skills ?? []).slice(0, max).map((s) => s.name);
}

/** Relação da pessoa logada com um perfil: seguindo, solicitação pendente (perfil privado) ou nada. */
export type FollowState = 'following' | 'requested' | 'none';

/** O que o toque em Seguir faz agora: seguir um público, pedir para seguir um privado, ou desfazer. */
export function nextFollowState(current: FollowState, isPublic: boolean): FollowState {
  if (current !== 'none') return 'none';
  return isPublic ? 'following' : 'requested';
}

export function followState(p: Pick<ExplorePerson, 'is_following' | 'requested'>): FollowState {
  if (p.is_following) return 'following';
  return p.requested ? 'requested' : 'none';
}

/**
 * Seguir, pedir para seguir ou desfazer no cache (atualização otimista). Funciona com os 3 formatos guardados:
 * lista paginada do Explorar, carrossel "Com objetivos parecidos" e perfil aberto (ajusta seguidores).
 */
export function applyFollow(data: unknown, personId: string, state: FollowState): unknown {
  if (!data) return data;
  const on = state === 'following';
  const requested = state === 'requested';
  const flip = (p: ExplorePerson) => (p.id === personId ? { ...p, is_following: on, requested } : p);

  if (Array.isArray(data)) return (data as ExplorePerson[]).map(flip);

  const pages = (data as InfiniteData<ExplorePerson[]>).pages;
  if (Array.isArray(pages)) {
    return { ...(data as InfiniteData<ExplorePerson[]>), pages: pages.map((page) => page.map(flip)) };
  }

  const profile = data as PublicProfile;
  if (profile.id !== personId) return data;
  if (profile.is_following === on && !!profile.requested === requested) return data;
  const followers = profile.is_following === on ? profile.followers : Math.max(0, profile.followers + (on ? 1 : -1));
  return { ...profile, is_following: on, requested, followers };
}

/** Tira uma pessoa das listas paginadas (ex.: solicitação aceita ou recusada). */
export function removeFromPages(data: unknown, personId: string): unknown {
  const pages = (data as InfiniteData<ExplorePerson[]> | undefined)?.pages;
  if (!Array.isArray(pages)) return data;
  return {
    ...(data as InfiniteData<ExplorePerson[]>),
    pages: pages.map((page) => page.filter((p) => p.id !== personId)),
  };
}

/** Próxima página: só se a última veio cheia. */
export function nextOffset(lastPage: unknown[], allPages: unknown[][], pageSize: number) {
  return lastPage.length < pageSize ? undefined : allPages.reduce((n, page) => n + page.length, 0);
}
