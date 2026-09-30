import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';

import { useAuth } from '@/features/auth/AuthProvider';
import { progressKeys } from '@/features/progress/api';
import { t } from '@/i18n';
import { ApiError, callFunction } from '@/lib/api';
import { supabase } from '@/lib/supabase';

import type { FullReport, LinkedInReportRow, LinkedInUsage, PasteFields, PickedFile, SummaryReport } from './types';

const BUCKET = 'linkedin-uploads';

/** Todas as chaves do LinkedIn começam com 'linkedin': invalidar essa raiz recarrega tudo. */
const keys = {
  all: ['linkedin'] as const,
  usage: (userId?: string) => ['linkedin', 'usage', userId] as const,
  list: (userId?: string) => ['linkedin', 'list', userId] as const,
  report: (id: string) => ['linkedin', 'report', id] as const,
};

function useUserId() {
  return useAuth().session?.user.id;
}

/** Uso do mês (função SQL linkedin_usage). O limite de verdade é conferido na Edge Function. */
export function useLinkedInUsage() {
  const userId = useUserId();
  return useQuery({
    queryKey: keys.usage(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('linkedin_usage');
      if (error) throw error;
      return data as LinkedInUsage;
    },
  });
}

export type ReportListItem = Pick<LinkedInReportRow, 'id' | 'created_at' | 'is_full' | 'overall_score'>;

/** Relatórios anteriores (T10), do mais recente para o mais antigo. */
export function useLinkedInReports() {
  const userId = useUserId();
  return useQuery({
    queryKey: keys.list(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('linkedin_reports')
        .select('id, created_at, is_full, overall_score')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as ReportListItem[];
    },
  });
}

export function useLinkedInReport(id: string) {
  return useQuery({
    queryKey: keys.report(id),
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('linkedin_reports').select('*').eq('id', id).single();
      if (error) throw error;
      return data as LinkedInReportRow;
    },
  });
}

export type AnalyzeInput =
  | { source: 'pdf'; file: PickedFile; target_role?: string }
  | { source: 'paste'; sections: PasteFields; target_role?: string };

type AnalyzeResult = { report_id: string; is_full: boolean; report: FullReport | SummaryReport };

/**
 * "Analisar meu perfil". PDF: envia para linkedin-uploads/{user_id}/{uuid}.pdf e chama a função
 * (que lê e apaga o arquivo). Texto: chama direto. Nunca repete sozinho (consome o limite do mês).
 */
export function useAnalyzeLinkedIn() {
  const queryClient = useQueryClient();
  const userId = useUserId();
  return useMutation({
    mutationFn: async (input: AnalyzeInput): Promise<AnalyzeResult> => {
      const target_role = input.target_role?.trim() || undefined;
      if (input.source === 'paste') {
        return callFunction<AnalyzeResult>('analyze-linkedin', { source: 'paste', sections: input.sections, target_role });
      }
      if (!userId) throw new ApiError('UNAUTHENTICATED', t.errors.UNAUTHENTICATED);
      const storage_path = await uploadPdf(userId, input.file);
      return callFunction<AnalyzeResult>('analyze-linkedin', { source: 'pdf', storage_path, target_role });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      // Relatório gerado marca o dia como ativo: recarrega a sequência.
      queryClient.invalidateQueries({ queryKey: progressKeys.all });
    },
  });
}

async function uploadPdf(userId: string, file: PickedFile) {
  const path = `${userId}/${Crypto.randomUUID()}.pdf`;
  let bytes: ArrayBuffer;
  try {
    bytes = await new File(file.uri).arrayBuffer();
  } catch {
    throw new ApiError('INVALID_INPUT', t.analyze.pickError);
  }
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: 'application/pdf', upsert: false });
  if (error) throw new ApiError('NETWORK', t.analyze.uploadError);
  return path;
}

/** Salva as caixinhas marcadas do checklist (T12). */
export function useSaveChecklist(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (state: Record<string, boolean>) => {
      const { error } = await supabase.from('linkedin_reports').update({ checklist_state: state }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, state) => {
      queryClient.setQueryData<LinkedInReportRow>(keys.report(id), (old) => (old ? { ...old, checklist_state: state } : old));
    },
  });
}
