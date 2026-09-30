import type {
  Area,
  Availability,
  Course,
  Education,
  Experience,
  Goal,
  Skill,
  WorkFormat,
} from '@/features/profile/types';
import type { VerifiedKind } from '@/features/profile/verified';

/**
 * Uma pessoa na lista do Explorar (explore_profiles, similar_profiles, follow_list, follow_requests_list).
 * Perfil privado que a pessoa logada não segue vem só com o básico (título, cidade, área, objetivo e competências vazios).
 */
export type ExplorePerson = {
  id: string;
  name: string | null;
  username: string | null;
  headline: string | null;
  city: string | null;
  area: Area | null;
  goal: Goal | null;
  skills: Skill[];
  photo_path: string | null;
  is_following: boolean;
  /** Pediu para seguir este perfil privado e ainda não foi aceito. */
  requested: boolean;
  is_public: boolean;
  verified: VerifiedKind | null;
};

/** Perfil de outra pessoa (função public_profile). Nunca tem e-mail, idade, plano ou notas. */
export type PublicProfile = {
  id: string;
  name: string | null;
  username: string | null;
  headline: string | null;
  city: string | null;
  bio: string | null;
  area: Area | null;
  goal: Goal | null;
  availability: Availability[];
  work_format: WorkFormat | null;
  skills: Skill[];
  experiences: Experience[];
  education: Education[];
  courses: Course[];
  photo_path: string | null;
  cover_path: string | null;
  cover_x: number;
  cover_y: number;
  followers: number;
  following: number;
  is_following: boolean;
  first_simulation: boolean;
  /** Maior sequência de dias: 7, 3 ou 0. */
  streak_badge: number;
  linkedin_done: boolean;
  requested: boolean;
  is_public: boolean;
  verified: VerifiedKind | null;
};

/** Motivos da denúncia (mesmos códigos do banco). */
export const REPORT_REASONS = ['perfil_falso', 'assedio', 'golpe', 'conteudo_improprio', 'outro'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/** Chips de filtro do Explorar (múltipla escolha). */
export type ExploreFilter = 'area' | 'goal' | 'near' | 'estagio' | 'jovem_aprendiz';

export const EXPLORE_PAGE_SIZE = 20;
export const DETAIL_MAX = 500;

/** Listas de conexões de um perfil. "requests" (Solicitações) só existe no próprio perfil. */
export const FOLLOW_KINDS = ['followers', 'following'] as const;
export type FollowKind = (typeof FOLLOW_KINDS)[number];
export type ConnectionsTab = FollowKind | 'requests';

/** Resposta de follow_user: público segue na hora, privado vira solicitação. */
export type FollowResult = 'following' | 'requested';
export type FollowCounts = { followers: number; following: number };
