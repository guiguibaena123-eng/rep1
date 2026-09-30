/** Idade mínima do MVP (decisão de produto). */
export const MIN_AGE = 16;
export const MAX_AGE = 60;
export const DEFAULT_AGE = 18;

export const GOALS = ['jovem_aprendiz', 'estagio', 'primeiro_emprego', 'novo_emprego'] as const;
export const AREAS = ['atendimento', 'vendas', 'administrativo', 'tecnologia', 'marketing', 'logistica', 'saude', 'outra'] as const;

export type Goal = (typeof GOALS)[number];
export type Area = (typeof AREAS)[number];
export type Plan = 'free' | 'premium';

// ---------- Perfil completo (Prompt 3: T18/T19) ----------

export const AVAILABILITY = ['manha', 'tarde', 'noite', 'fim_de_semana'] as const;
export const WORK_FORMATS = ['presencial', 'hibrido', 'remoto'] as const;
export const SKILL_TYPES = ['comportamental', 'tecnica'] as const;
export const EDUCATION_STATUS = ['cursando', 'concluido', 'trancado'] as const;
export const LANGUAGE_LEVELS = ['basico', 'intermediario', 'avancado', 'fluente', 'nativo'] as const;

export type Availability = (typeof AVAILABILITY)[number];
export type WorkFormat = (typeof WORK_FORMATS)[number];
export type SkillType = (typeof SKILL_TYPES)[number];
export type EducationStatus = (typeof EDUCATION_STATUS)[number];
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

/** "Destacada" não é salva: vem dos pontos fortes das simulações (highlightSkills em details.ts). */
export type Skill = { name: string; type: SkillType };
/** end null = "atual" (ainda faz). Datas em texto livre curto, ex.: "ago 2026". */
export type Experience = { title: string; place: string; start: string; end: string | null; description: string };
export type Education = { course: string; institution: string; status: EducationStatus; year: string };
export type Course = { name: string; institution: string; year: string };
export type Language = { language: string; level: LanguageLevel };

/** Espelho da tabela public.profiles (supabase/migrations). */
export type Profile = {
  id: string;
  created_at: string;
  name: string | null;
  /** Nome de usuário (@), sem o @. Gerado a partir do nome; a pessoa pode trocar na T19. */
  username: string | null;
  age: number | null;
  goal: Goal | null;
  area: Area | null;
  nervousness: number | null;
  plan: Plan;
  premium_until: string | null;
  reminder_enabled: boolean;
  reminder_time: string | null;
  theme: 'auto' | 'light' | 'dark';
  onboarding_done: boolean;
  accepted_terms_at: string | null;
  /** Caminho no bucket privado "avatars" ({user_id}/avatar-….jpg). */
  photo_path: string | null;
  /** Foto de capa da T18, no mesmo bucket ({user_id}/cover-….jpg). Opcional. */
  cover_path: string | null;
  /** Parte da capa que aparece (0 = esquerda/cima, 50 = centro, 100 = direita/baixo). */
  cover_x: number;
  cover_y: number;
  headline: string | null;
  city: string | null;
  bio: string | null;
  skills: Skill[];
  availability: Availability[];
  work_format: WorkFormat | null;
  experiences: Experience[];
  education: Education[];
  courses: Course[];
  languages: Language[];
  linkedin_url: string | null;
  portfolio_url: string | null;
  /** Usuário do Instagram, sem @ (o link é montado pelo app). */
  instagram: string | null;
  /** Mostra a nota média no Meu perfil (padrão: sim; a pessoa pode ocultar). */
  show_average: boolean;
  /** "Aparecer no Explorar" (T19 › Privacidade). Padrão: desligado para todo mundo. */
  is_public: boolean;
};

/** Campos do perfil completo, editados na T19. */
export const DETAIL_FIELDS = [
  'photo_path',
  'cover_path',
  'cover_x',
  'cover_y',
  'name',
  'username',
  'headline',
  'city',
  'bio',
  'skills',
  'goal',
  'area',
  'availability',
  'work_format',
  'experiences',
  'education',
  'courses',
  'languages',
  'linkedin_url',
  'portfolio_url',
  'instagram',
  'is_public',
] as const;

export type ProfileDetails = Pick<Profile, (typeof DETAIL_FIELDS)[number]>;

/** Colunas que o app pode alterar (o banco bloqueia plan e premium_until). */
export type ProfileUpdate = Partial<
  Pick<
    Profile,
    | 'name'
    | 'age'
    | 'goal'
    | 'area'
    | 'nervousness'
    | 'reminder_enabled'
    | 'reminder_time'
    | 'theme'
    | 'onboarding_done'
    | 'accepted_terms_at'
    | 'show_average'
    | (typeof DETAIL_FIELDS)[number]
  >
>;

/** Premium só vale com plan = 'premium' e validade nula ou no futuro (mesma regra do servidor). */
export function isPremium(p: Pick<Profile, 'plan' | 'premium_until'> | null | undefined, now = new Date()) {
  if (!p || p.plan !== 'premium') return false;
  return !p.premium_until || new Date(p.premium_until) > now;
}

/** Iniciais para o avatar: "Ana Souza" → "AS", "Ana" → "AN". */
export function initials(name: string | null | undefined) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
