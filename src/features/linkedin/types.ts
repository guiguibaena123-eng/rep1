// Os formatos do relatório vêm do mesmo arquivo usado pela Edge Function (só tipos: somem no build).
import type {
  FullReport,
  LinkedInSection,
  Priority,
  SectionKey,
  SummaryReport,
} from '../../../supabase/functions/_shared/linkedin-logic';

export type { FullReport, LinkedInSection, Priority, SectionKey, SummaryReport };

/** Mesmos limites do servidor (supabase/functions/_shared/linkedin-logic.ts). */
export const PDF_MAX_BYTES = 5 * 1024 * 1024;
export const PASTE_MIN_CHARS = 50;
export const PASTE_FIELD_MAX = 5_000;
export const TARGET_ROLE_MAX = 80;

export type PasteFields = { headline: string; about: string; experience: string; education_skills: string };
export const PASTE_KEYS = ['headline', 'about', 'experience', 'education_skills'] as const;
export const EMPTY_PASTE: PasteFields = { headline: '', about: '', experience: '', education_skills: '' };

/** Espelho de public.linkedin_reports. Grátis (is_full = false) só tem o resumo. */
export type LinkedInReportRow = {
  id: string;
  created_at: string;
  source: 'pdf' | 'paste';
  target_role: string | null;
  is_full: boolean;
  report: FullReport | SummaryReport;
  overall_score: number;
  checklist_state: Record<string, boolean>;
};

export type LinkedInUsage = { premium: boolean; used: number; limit: number; resets_at: string };

/** Arquivo escolhido na T11. */
export type PickedFile = { uri: string; name: string; size: number | null; mimeType: string | null };

export type FileProblem = 'not_pdf' | 'too_big' | null;

/** Confere o arquivo antes de enviar: só PDF e no máximo 5 MB. */
export function checkFile(file: Pick<PickedFile, 'name' | 'size' | 'mimeType'>): FileProblem {
  const isPdf = file.mimeType === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (!isPdf) return 'not_pdf';
  if (file.size != null && file.size > PDF_MAX_BYTES) return 'too_big';
  return null;
}

/** "Sobre" OU "Experiências" com 50+ caracteres (mesma regra do servidor). */
export function pasteIsEnough(p: Pick<PasteFields, 'about' | 'experience'>) {
  return p.about.trim().length >= PASTE_MIN_CHARS || p.experience.trim().length >= PASTE_MIN_CHARS;
}

export function isFullReport(row: Pick<LinkedInReportRow, 'is_full' | 'report'>): row is { is_full: true; report: FullReport } {
  return row.is_full && 'sections' in row.report;
}

/** "184 KB" / "2,4 MB". */
export function formatBytes(bytes: number | null) {
  if (bytes == null) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}
