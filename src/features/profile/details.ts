/**
 * Regras do perfil completo (T18/T19), sem nada de tela: % completo, validação,
 * competências e "tem mudança não salva?". Testado em __tests__/details.test.ts.
 */
import { getLanguage, t } from '@/i18n';

import { BEHAVIORAL_HINTS, SKILL_SUGGESTIONS, TECHNICAL_HINTS } from './skillSuggestions';
import { DETAIL_FIELDS, type Area, type Availability, type Profile, type ProfileDetails, type Skill, type SkillType } from './types';

export const NAME_MIN = 2;
export const NAME_MAX = 60;
export const HEADLINE_MAX = 120;
export const CITY_MAX = 80;
export const BIO_MAX = 400;
/** Bio conta para o % completo a partir deste tamanho. */
export const BIO_MIN_COMPLETE = 80;
export const SKILLS_MAX = 15;
export const SKILL_NAME_MAX = 40;
export const LINK_MAX = 200;
export const SUGGESTIONS_SHOWN = 4;

// ---------- Perfil completo ----------

export type MissingKey = keyof typeof t.myProfile.missing;

/** Pesos do "Perfil X% completo" (somam 100), na ordem em que o que falta é mostrado. */
export const COMPLETENESS: { key: MissingKey; points: number; done: (d: ProfileDetails) => boolean }[] = [
  { key: 'photo', points: 10, done: (d) => !!d.photo_path },
  { key: 'headline', points: 10, done: (d) => filled(d.headline) },
  { key: 'city', points: 5, done: (d) => filled(d.city) },
  { key: 'bio', points: 15, done: (d) => (d.bio ?? '').trim().length >= BIO_MIN_COMPLETE },
  { key: 'skills', points: 15, done: (d) => d.skills.length >= 3 },
  { key: 'goal', points: 10, done: (d) => !!d.goal && d.availability.length > 0 },
  { key: 'experience', points: 15, done: (d) => d.experiences.length >= 1 },
  { key: 'education', points: 10, done: (d) => d.education.length >= 1 },
  { key: 'language', points: 5, done: (d) => d.languages.length >= 1 },
  { key: 'linkedin', points: 5, done: (d) => filled(d.linkedin_url) && isValidLink(d.linkedin_url!, 'linkedin') },
];

/** % completo e o primeiro item que falta (null quando está tudo pronto). */
export function completeness(d: ProfileDetails): { pct: number; missing: MissingKey | null } {
  let pct = 0;
  let missing: MissingKey | null = null;
  for (const item of COMPLETENESS) {
    if (item.done(d)) pct += item.points;
    else missing ??= item.key;
  }
  return { pct, missing };
}

// ---------- Links ----------

const URL_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i;

/** Aceita com ou sem "https://". Para o LinkedIn, o endereço precisa ser do linkedin.com. */
export function isValidLink(value: string, kind: 'linkedin' | 'any' = 'any') {
  const v = value.trim();
  if (!v || /\s/.test(v) || v.length > LINK_MAX || !URL_RE.test(v)) return false;
  if (kind === 'linkedin') return /^(https?:\/\/)?([a-z0-9-]+\.)*linkedin\.com(\/|$)/i.test(v);
  return true;
}

/** Endereço pronto para abrir (coloca https:// quando a pessoa não digitou). */
export function linkHref(value: string) {
  const v = value.trim();
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Como o link aparece na tela: sem "https://" e sem "www.". */
export function linkLabel(value: string) {
  return value.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
}

const INSTAGRAM_USER_RE = /^[A-Za-z0-9._]{1,30}$/;

/**
 * Usuário do Instagram a partir do que a pessoa digitou: "@ana.souza", "ana.souza"
 * ou o link (instagram.com/ana.souza). null quando não dá para reconhecer.
 */
export function instagramHandle(value: string | null | undefined): string | null {
  let v = (value ?? '').trim();
  const fromUrl = v.match(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#\s]+)/i);
  if (fromUrl) v = fromUrl[1];
  v = v.replace(/^@/, '');
  return INSTAGRAM_USER_RE.test(v) ? v : null;
}

export function instagramHref(handle: string) {
  return `https://instagram.com/${handle}`;
}

// ---------- Validação da T19 ----------

export type FieldErrors = Partial<
  Record<'name' | 'headline' | 'city' | 'bio' | 'linkedin_url' | 'portfolio_url' | 'instagram', string>
>;

export function validateDetails(d: ProfileDetails): FieldErrors {
  const e = t.editProfile;
  const errors: FieldErrors = {};
  const name = (d.name ?? '').trim();

  if (!name) errors.name = e.nameEmpty;
  else if (name.length < NAME_MIN) errors.name = e.nameShort;
  else if (name.length > NAME_MAX) errors.name = e.tooLong(NAME_MAX);

  if ((d.headline ?? '').trim().length > HEADLINE_MAX) errors.headline = e.tooLong(HEADLINE_MAX);
  if ((d.city ?? '').trim().length > CITY_MAX) errors.city = e.tooLong(CITY_MAX);
  if ((d.bio ?? '').trim().length > BIO_MAX) errors.bio = e.tooLong(BIO_MAX);

  if (filled(d.linkedin_url) && !isValidLink(d.linkedin_url!, 'linkedin')) errors.linkedin_url = e.linkInvalid;
  if (filled(d.portfolio_url) && !isValidLink(d.portfolio_url!)) errors.portfolio_url = e.linkInvalid;
  if (filled(d.instagram) && !instagramHandle(d.instagram)) errors.instagram = e.instagramInvalid;

  return errors;
}

// ---------- Competências ----------

/** Para comparar sem diferenciar maiúsculas, acentos e espaços a mais. */
export function normalizeText(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function hasSkill(skills: readonly Skill[], name: string) {
  const n = normalizeText(name);
  return skills.some((s) => normalizeText(s.name) === n);
}

export type AddSkillResult = { ok: true; skills: Skill[] } | { ok: false; reason: 'empty' | 'duplicate' | 'full' };

/** Adiciona no fim da lista. Recusa vazia, repetida (sem diferenciar maiúsculas) e acima de 15. */
export function addSkill(skills: readonly Skill[], rawName: string, type: SkillType): AddSkillResult {
  const name = rawName.replace(/\s+/g, ' ').trim().slice(0, SKILL_NAME_MAX);
  if (!name) return { ok: false, reason: 'empty' };
  if (hasSkill(skills, name)) return { ok: false, reason: 'duplicate' };
  if (skills.length >= SKILLS_MAX) return { ok: false, reason: 'full' };
  return { ok: true, skills: [...skills, { name, type }] };
}

export function removeSkill(skills: readonly Skill[], name: string): Skill[] {
  const n = normalizeText(name);
  return skills.filter((s) => normalizeText(s.name) !== n);
}

/**
 * Tipo "óbvio" da competência: vem da lista de sugestões ou de palavras conhecidas.
 * null = não dá para saber (a T19 pergunta; o padrão é comportamental).
 */
export function guessSkillType(name: string): SkillType | null {
  const n = normalizeText(name);
  // Sugestões de todos os idiomas (a pessoa pode ter trocado de idioma depois de adicionar).
  for (const byArea of Object.values(SKILL_SUGGESTIONS)) {
    for (const list of Object.values(byArea)) {
      const found = list.find((s) => normalizeText(s.name) === n);
      if (found) return found.type;
    }
  }
  // Palavras-chave só do idioma atual: entre idiomas, pedaços curtos podem significar outra coisa.
  const lang = getLanguage();
  const technical = TECHNICAL_HINTS[lang].some((h) => n.includes(normalizeText(h)));
  const behavioral = BEHAVIORAL_HINTS[lang].some((h) => n.includes(normalizeText(h)));
  if (technical && !behavioral) return 'tecnica';
  if (behavioral && !technical) return 'comportamental';
  return null;
}

/** Até 4 sugestões da área, no idioma do app, que a pessoa ainda não tem. */
export function skillSuggestions(area: Area | null, skills: readonly Skill[]): Skill[] {
  return SKILL_SUGGESTIONS[getLanguage()][area ?? 'outra'].filter((s) => !hasSkill(skills, s.name)).slice(0, SUGGESTIONS_SHOWN);
}

/**
 * Destacadas: competências que aparecem nos pontos fortes ("O que foi bem") das simulações.
 * Sem simulações, nenhuma fica destacada.
 */
export function highlightSkills(skills: readonly Skill[], strengths: readonly string[]) {
  const texts = strengths.map(normalizeText);
  return skills.map((s) => {
    const n = normalizeText(s.name);
    return { ...s, highlighted: n.length > 0 && texts.some((text) => text.includes(n)) };
  });
}

// ---------- Formulário ----------

/** Campos da T19 a partir do perfil salvo (listas vazias em vez de null). */
export function detailsFromProfile(p: Profile): ProfileDetails {
  return {
    photo_path: p.photo_path ?? null,
    cover_path: p.cover_path ?? null,
    cover_x: p.cover_x ?? 50,
    cover_y: p.cover_y ?? 50,
    name: p.name ?? '',
    headline: p.headline ?? '',
    city: p.city ?? '',
    bio: p.bio ?? '',
    skills: p.skills ?? [],
    goal: p.goal,
    area: p.area,
    availability: p.availability ?? [],
    work_format: p.work_format ?? null,
    experiences: p.experiences ?? [],
    education: p.education ?? [],
    courses: p.courses ?? [],
    languages: p.languages ?? [],
    linkedin_url: p.linkedin_url ?? '',
    portfolio_url: p.portfolio_url ?? '',
    // No formulário aparece com @; no banco fica só o usuário.
    instagram: p.instagram ? `@${p.instagram}` : '',
    is_public: p.is_public ?? false,
  };
}

/** O que vai para o banco: textos sem espaços nas pontas e vazio → null. */
export function detailsToUpdate(d: ProfileDetails): ProfileDetails {
  return {
    ...d,
    name: (d.name ?? '').trim(),
    headline: emptyToNull(d.headline),
    city: emptyToNull(d.city),
    bio: emptyToNull(d.bio),
    linkedin_url: emptyToNull(d.linkedin_url),
    portfolio_url: emptyToNull(d.portfolio_url),
    instagram: instagramHandle(d.instagram),
    availability: AVAILABILITY_ORDER.filter((a) => d.availability.includes(a)),
  };
}

/** Tem mudança não salva? Ignora espaços nas pontas e a ordem da disponibilidade. */
export function hasChanges(saved: ProfileDetails, current: ProfileDetails) {
  const a = detailsToUpdate(saved);
  const b = detailsToUpdate(current);
  return DETAIL_FIELDS.some((f) => JSON.stringify(a[f]) !== JSON.stringify(b[f]));
}

const AVAILABILITY_ORDER: Availability[] = ['manha', 'tarde', 'noite', 'fim_de_semana'];

/** "Manhã e tarde", "Manhã, tarde e noite". */
export function joinLabels(labels: readonly string[]) {
  if (labels.length === 0) return '';
  // Em alemão os substantivos seguem com maiúscula ("Vormittag und Nachmittag").
  const keepCase = getLanguage() === 'de';
  const lower = labels.map((l, i) => (i === 0 || keepCase ? l : l.charAt(0).toLowerCase() + l.slice(1)));
  if (lower.length === 1) return lower[0];
  return `${lower.slice(0, -1).join(', ')}${t.myProfile.and}${lower[lower.length - 1]}`;
}

export function availabilityLabel(list: readonly Availability[]) {
  return joinLabels(AVAILABILITY_ORDER.filter((a) => list.includes(a)).map((a) => t.options.availability[a]));
}

function filled(v: string | null | undefined) {
  return !!v && v.trim().length > 0;
}

function emptyToNull(v: string | null | undefined) {
  const s = (v ?? '').trim();
  return s ? s : null;
}
