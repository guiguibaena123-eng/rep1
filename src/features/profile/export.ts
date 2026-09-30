import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { APP_NAME, t } from '@/i18n';
import { supabase } from '@/lib/supabase';

/** Tabelas com dados da pessoa (todas protegidas por RLS: cada um só lê as próprias linhas). */
const TABLES = {
  simulacoes: 'interview_sessions',
  respostas: 'interview_answers',
  feedbacks: 'interview_feedback',
  relatorios_linkedin: 'linkedin_reports',
  dias_com_atividade: 'daily_activity',
} as const;

type Section = keyof typeof TABLES | 'dicas' | 'seguindo' | 'bloqueados';
export type ExportParts = { profile: Record<string, unknown> } & Record<Section, unknown[]>;

/** Monta o conteúdo do arquivo (função pura, testada em __tests__/export.test.ts). */
export function buildExport(parts: ExportParts, email: string | undefined, now: Date) {
  const { profile, ...rest } = parts;
  return {
    app: APP_NAME,
    gerado_em: now.toISOString(),
    conta: { email: email ?? null, ...profile },
    ...rest,
  };
}

/** Lê tudo da pessoa logada (perfil, simulações, respostas, feedbacks, relatórios, dicas, quem segue e bloqueou). */
async function fetchParts(userId: string): Promise<ExportParts> {
  const profileReq = supabase.from('profiles').select('*').eq('id', userId).single();
  const tipsReq = supabase
    .from('tip_progress')
    .select('read_at, favorited, helpful, created_at, tips(slug, title)')
    .eq('user_id', userId);
  const followsReq = supabase.from('follows').select('followed_id, created_at').eq('follower_id', userId).order('created_at');
  const blocksReq = supabase.from('blocks').select('blocked_id, created_at').eq('blocker_id', userId).order('created_at');
  const tableReqs = Object.entries(TABLES).map(async ([key, table]) => {
    const { data, error } = await supabase.from(table).select('*').eq('user_id', userId).order('created_at');
    if (error) throw error;
    return [key, data ?? []] as const;
  });

  const [profile, tips, follows, blocks, tables] = await Promise.all([
    profileReq,
    tipsReq,
    followsReq,
    blocksReq,
    Promise.all(tableReqs),
  ]);
  if (profile.error) throw profile.error;
  if (tips.error) throw tips.error;
  if (follows.error) throw follows.error;
  if (blocks.error) throw blocks.error;

  return {
    profile: profile.data as Record<string, unknown>,
    dicas: tips.data ?? [],
    seguindo: follows.data ?? [],
    bloqueados: blocks.data ?? [],
    ...(Object.fromEntries(tables) as Record<keyof typeof TABLES, unknown[]>),
  };
}

/** Gera o arquivo JSON e abre o compartilhamento do sistema (salvar, e-mail, WhatsApp…). */
export async function exportMyData(userId: string, email: string | undefined) {
  const content = buildExport(await fetchParts(userId), email, new Date());
  const file = new File(Paths.cache, 'siwki-meus-dados.json');
  file.create({ overwrite: true });
  file.write(JSON.stringify(content, null, 2));
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: t.profile.exportShareTitle,
  });
}
