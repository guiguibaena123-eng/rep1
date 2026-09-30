import type { Profile } from '@/features/profile/types';
import { t } from '@/i18n';
import { dateSP } from '@/lib/dates';

import type { Tip, TipCategory, TipProgress, Track } from './types';

/** Filtro dos chips da T13: todas, para você, só as salvas, ou uma categoria. */
export type TipFilter = 'all' | 'forYou' | 'saved' | TipCategory;

/** O que o cadastro (T4) sabe da pessoa e o "Para você" usa. */
export type TipProfile = Pick<Profile, 'goal' | 'area' | 'nervousness'>;

/** Nervosismo 1 = muito nervoso(a), 5 = tranquilo(a). Até 2 recebe as dicas de nervosismo. */
export const NERVOUS_MAX = 2;

/**
 * Quanto a dica combina com a pessoa (0 = não entra no "Para você").
 * Área pesa mais (é o mais específico), depois objetivo, depois nervosismo.
 */
export function forYouScore(tip: Tip, profile: TipProfile | null | undefined) {
  if (!profile) return 0;
  let score = 0;
  if (profile.area && tip.areas.includes(profile.area)) score += 3;
  if (profile.goal && tip.goals.includes(profile.goal)) score += 2;
  if (tip.for_nervous && profile.nervousness != null && profile.nervousness <= NERVOUS_MAX) score += 1;
  return score;
}

/** Dicas do "Para você", da que mais combina para a que menos combina (empate: ordem da lista). */
export function forYouTips(sorted: Tip[], profile: TipProfile | null | undefined) {
  return sorted
    .map((tip, index) => ({ tip, index, score: forYouScore(tip, profile) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((x) => x.tip);
}

/** Minúsculas e sem acento: "Currículo" acha "curriculo". */
export function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Ordem da lista: trilha (na ordem das trilhas), posição na trilha, depois título. */
export function sortTips(tips: Tip[], tracks: Track[]) {
  const trackOrder = new Map(tracks.map((tr) => [tr.id, tr.sort_order]));
  const rank = (tip: Tip) => (tip.track_id ? (trackOrder.get(tip.track_id) ?? 999) : 999);
  return [...tips].sort(
    (a, b) =>
      rank(a) - rank(b) || (a.track_order ?? 999) - (b.track_order ?? 999) || a.title.localeCompare(b.title, t.dates.locale),
  );
}

export function filterTips(
  tips: Tip[],
  filter: TipFilter,
  query: string,
  saved: Set<string>,
  profile?: TipProfile | null,
) {
  const q = normalize(query);
  const base = filter === 'forYou' ? forYouTips(tips, profile) : tips;
  return base.filter((tip) => {
    if (filter === 'saved' && !saved.has(tip.id)) return false;
    if (filter !== 'all' && filter !== 'saved' && filter !== 'forYou' && tip.category !== filter) return false;
    return !q || normalize(tip.title).includes(q);
  });
}

/** Dicas de uma trilha, na ordem. */
export function tipsOfTrack(tips: Tip[], trackId: string) {
  return tips
    .filter((tip) => tip.track_id === trackId)
    .sort((a, b) => (a.track_order ?? 0) - (b.track_order ?? 0));
}

export type TrackProgress = {
  read: number;
  total: number;
  /** Primeira dica ainda não lida (ou a primeira da trilha, se já leu todas). */
  next: Tip | null;
};

/** Progresso da trilha = dicas lidas / total (Prompt 2, T13). */
export function trackProgress(tips: Tip[], trackId: string, readIds: Set<string>): TrackProgress {
  const list = tipsOfTrack(tips, trackId);
  const read = list.filter((tip) => readIds.has(tip.id)).length;
  const next = list.find((tip) => !readIds.has(tip.id)) ?? list[0] ?? null;
  return { read, total: list.length, next };
}

/**
 * "Próxima dica" (T14): a seguinte na trilha; se for a última da trilha (ou não tiver trilha),
 * a próxima da mesma categoria na ordem da lista. Sem próxima: null.
 */
export function nextTip(current: Tip, sorted: Tip[]): Tip | null {
  if (current.track_id) {
    const inTrack = tipsOfTrack(sorted, current.track_id);
    const after = inTrack.find((tip) => (tip.track_order ?? 0) > (current.track_order ?? 0));
    if (after) return after;
  }
  const sameCategory = sorted.filter((tip) => tip.category === current.category);
  const index = sameCategory.findIndex((tip) => tip.id === current.id);
  return sameCategory[index + 1] ?? null;
}

/** Dia do ano (1 a 366) no fuso de São Paulo. */
export function dayOfYearSP(now: Date) {
  const [y, m, d] = dateSP(now).split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86_400_000) + 1;
}

/**
 * Dica do dia (T5): escolhida pelo dia do ano entre as dicas que o plano da pessoa libera.
 * Mesma dica o dia todo, para todo mundo do mesmo plano.
 */
export function tipOfTheDay(tips: Tip[], premium: boolean, now: Date): Tip | null {
  const available = tips.filter((tip) => premium || !tip.is_premium).sort((a, b) => a.slug.localeCompare(b.slug));
  if (available.length === 0) return null;
  return available[dayOfYearSP(now) % available.length];
}

/** Trilha sugerida a quem ainda não começou nenhuma (mesmo slug em todos os idiomas). */
export const STARTER_TRACK_SLUG = 'entrevista-sem-medo';
/** Quantas dicas o carrossel da Início mostra. */
export const HOME_TIPS_COUNT = 3;

export type HomeTrackCard = {
  track: Track;
  /** Dia da trilha = próxima leitura (lidas + 1), sem passar do total. */
  day: number;
  total: number;
  read: number;
  /** Leitura do dia (a primeira ainda não lida). */
  next: Tip;
  /** false = trilha sugerida, ainda não começada. */
  started: boolean;
};

/**
 * Card de trilha da Início ("Dicas para você"):
 * - a trilha em andamento (alguma lida e alguma não lida); com várias, a da leitura mais recente;
 * - sem trilha em andamento: sugere "Entrevista sem medo" (ou a próxima trilha ainda não começada);
 * - todas concluídas: null (o card some).
 */
export function homeTrack(tips: Tip[], tracks: Track[], rows: TipProgress[]): HomeTrackCard | null {
  const readAt = new Map(rows.flatMap((r) => (r.read_at ? [[r.tip_id, r.read_at] as const] : [])));
  const readIds = new Set(readAt.keys());
  const cards = tracks.flatMap((track) => {
    const p = trackProgress(tips, track.id, readIds);
    if (!p.next || p.total === 0) return [];
    const last = tipsOfTrack(tips, track.id).reduce((max, tip) => {
      const at = readAt.get(tip.id);
      return at && at > max ? at : max;
    }, '');
    return [{ track, p, last }];
  });

  const inProgress = cards
    .filter((c) => c.p.read > 0 && c.p.read < c.p.total)
    .sort((a, b) => b.last.localeCompare(a.last))[0];
  const notStarted = cards.filter((c) => c.p.read === 0);
  const pick =
    inProgress ?? notStarted.find((c) => c.track.slug === STARTER_TRACK_SLUG) ?? [...notStarted].sort((a, b) => a.track.sort_order - b.track.sort_order)[0];
  if (!pick || !pick.p.next) return null;
  return {
    track: pick.track,
    day: Math.min(pick.p.read + 1, pick.p.total),
    total: pick.p.total,
    read: pick.p.read,
    next: pick.p.next,
    started: pick.p.read > 0,
  };
}

/**
 * Carrossel da Início: até 3 dicas ainda não lidas, primeiro as que combinam com a área e o
 * objetivo do perfil (mesma nota do "Para você"), depois as outras na ordem da lista.
 * A leitura do dia da trilha não se repete aqui.
 */
export function homeTips(
  sorted: Tip[],
  rows: TipProgress[],
  profile: TipProfile | null | undefined,
  skipId?: string,
  count = HOME_TIPS_COUNT,
): Tip[] {
  const { read } = progressSets(rows);
  const unread = sorted.filter((tip) => !read.has(tip.id) && tip.id !== skipId);
  const matched = forYouTips(unread, profile);
  const matchedIds = new Set(matched.map((tip) => tip.id));
  return [...matched, ...unread.filter((tip) => !matchedIds.has(tip.id))].slice(0, count);
}

/** Índices rápidos a partir das linhas de tip_progress. */
export function progressSets(rows: TipProgress[]) {
  const read = new Set<string>();
  const saved = new Set<string>();
  for (const row of rows) {
    if (row.read_at) read.add(row.tip_id);
    if (row.favorited) saved.add(row.tip_id);
  }
  return { read, saved };
}

/** "**Quem você é:** nome…" → trechos com e sem negrito. */
export function splitBold(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('**') && part.endsWith('**') ? { text: part.slice(2, -2), bold: true } : { text: part, bold: false },
    );
}
