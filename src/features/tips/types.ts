import { z } from 'zod';

import type { Area, Goal } from '@/features/profile/types';

export const TIP_CATEGORIES = ['curriculo', 'entrevista', 'linkedin', 'primeiro_emprego', 'direitos', 'salario'] as const;
export type TipCategory = (typeof TIP_CATEGORIES)[number];

/** Espelho da tabela public.tips, sem o texto (body): ele vem pela função tip_body(). */
export type Tip = {
  id: string;
  slug: string;
  title: string;
  category: TipCategory;
  read_minutes: number;
  is_premium: boolean;
  track_id: string | null;
  track_order: number | null;
  /** Para quem a dica é mais útil (filtro "Para você"). Vazio = dica geral. */
  goals: Goal[];
  areas: Area[];
  for_nervous: boolean;
};

/** Colunas que o app pode ler (o banco não libera body direto). */
export const TIP_COLUMNS =
  'id, slug, title, category, read_minutes, is_premium, track_id, track_order, goals, areas, for_nervous';

export type Track = {
  id: string;
  slug: string;
  title: string;
  description: string;
  sort_order: number;
};

export type TipProgress = {
  tip_id: string;
  read_at: string | null;
  favorited: boolean;
  helpful: boolean | null;
};

/**
 * Blocos do texto da dica (Prompt 2, seção 9.5) + "h" (subtítulo) e "ordered" na lista,
 * que aparecem no design da T14, e "sources" (fontes, pedido do usuário). **texto** vira negrito.
 */
const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('p'), text: z.string() }),
  z.object({ type: z.literal('h'), text: z.string() }),
  z.object({ type: z.literal('list'), items: z.array(z.string()), ordered: z.boolean().optional() }),
  z.object({ type: z.literal('example'), title: z.string().optional(), text: z.string() }),
  z.object({ type: z.literal('warning'), text: z.string() }),
  // Fontes no fim da dica. Só links https (o banco é editado à mão no painel).
  z.object({
    type: z.literal('sources'),
    items: z.array(z.object({ title: z.string(), url: z.string().regex(/^https:\/\//) })).min(1),
  }),
]);

export type TipBlock = z.infer<typeof blockSchema>;

/** Lê o body vindo do banco. Blocos com formato errado são ignorados (a tela não quebra). */
export function parseTipBody(raw: unknown): TipBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((b) => {
    const parsed = blockSchema.safeParse(b);
    return parsed.success ? [parsed.data] : [];
  });
}
