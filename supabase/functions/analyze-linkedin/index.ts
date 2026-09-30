// Analisa o perfil do LinkedIn (PDF enviado ao Storage ou textos colados).
// Entrada: { source: 'pdf'|'paste', storage_path?, sections?, target_role? }  →  Saída: { report_id, is_full, report }
// Grátis recebe só o resumo (nota + 3 prioridades): o corte é feito AQUI, não no app.
// O PDF é SEMPRE apagado do Storage no fim, dando certo ou errado.

import { extractText, getDocumentProxy } from 'npm:unpdf@1';

import { adminClient, requireUser } from '../_shared/auth.ts';
import { AppError, handler, ok } from '../_shared/http.ts';
import { dateSP } from '../_shared/interview-logic.ts';
import {
  analyzeInputSchema,
  appProfileContext,
  buildLinkedInPrompt,
  cleanProfileText,
  cleanTargetRole,
  isOwnUploadPath,
  parseLinkedInReport,
  pasteIsEnough,
  pasteToText,
  PDF_MAX_BYTES,
  PDF_MIN_CHARS,
  PDF_UNREADABLE_MESSAGE,
  toSummary,
  type AnalyzeInput,
} from '../_shared/linkedin-logic.ts';
import { langFromRequest, OUTPUT_LANGUAGE, type OutputLanguage } from '../_shared/lang.ts';
import { checkRateLimit, releaseUsage, reserveLinkedIn } from '../_shared/limits.ts';
import { createLLMClient, generateValidated } from '../_shared/llm.ts';

const BUCKET = 'linkedin-uploads';

type Admin = ReturnType<typeof adminClient>;

Deno.serve(
  handler('analyze-linkedin', async (req) => {
    const admin = adminClient();
    const user = await requireUser(req, admin);

    const parsed = analyzeInputSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new AppError('INVALID_INPUT', 'Envie o PDF ou cole os textos do seu perfil.');
    const input = parsed.data;

    const path = input.source === 'pdf' ? (input.storage_path ?? '') : null;
    if (path !== null && !isOwnUploadPath(path, user.id)) {
      throw new AppError('INVALID_INPUT', 'Não encontramos o arquivo. Escolha o PDF de novo.');
    }

    try {
      await checkRateLimit(admin, user.id, 'analyze-linkedin');

      // 1. Completo (Premium) ou resumo (grátis): reserva a vaga do mês ANTES de gastar a IA
      //    (pedidos simultâneos não furam o limite). Se algo falhar, a vaga é devolvida.
      const { full, reservation } = await reserveLinkedIn(admin, user.id);
      try {
        return await analyze(admin, user.id, input, path, full, OUTPUT_LANGUAGE[langFromRequest(req)]);
      } catch (err) {
        await releaseUsage(admin, user.id, [reservation]);
        throw err;
      }
    } finally {
      // O PDF nunca fica guardado: apaga mesmo se algo falhou no meio.
      if (path !== null) {
        const { error } = await admin.storage.from(BUCKET).remove([path]);
        if (error) console.error(JSON.stringify({ fn: 'analyze-linkedin', error: 'storage_remove' }));
      }
    }
  }),
);

/** Lê o perfil, pede o relatório à IA e salva. A vaga do mês já está reservada. */
async function analyze(
  admin: Admin,
  userId: string,
  input: AnalyzeInput,
  path: string | null,
  full: boolean,
  language: OutputLanguage,
) {
  // 2. Texto do perfil.
  let raw: string;
  if (path !== null) {
    raw = await readPdf(admin, path);
    if (raw.replace(/\s/g, '').length < PDF_MIN_CHARS) throw new AppError('PDF_UNREADABLE', PDF_UNREADABLE_MESSAGE);
  } else {
    const sections = input.sections;
    if (!sections || !pasteIsEnough(sections)) {
      throw new AppError('INVALID_INPUT', 'Preencha o "Sobre" ou as "Experiências" com pelo menos 50 caracteres.');
    }
    raw = pasteToText(sections);
  }

  // 3. Limita a 12.000 caracteres.
  const profileText = cleanProfileText(raw);
  const targetRole = cleanTargetRole(input.target_role);
  // Título, bio e competências do "Meu perfil" como contexto (se falhar, segue sem).
  const { data: appProfile } = await admin.from('profiles').select('headline, bio, skills').eq('id', userId).maybeSingle();
  const appContext = appProfileContext(appProfile);

  // 4. Relatório da IA, validado (1 nova tentativa se vier errado).
  const fullReport = await generateValidated(
    createLLMClient(),
    { ...buildLinkedInPrompt({ profileText, targetRole, appContext, language }), temperature: 0.4 },
    parseLinkedInReport,
    'Não conseguimos analisar seu perfil agora. Tente de novo.',
  );

  // 5. Grátis: guarda só o resumo. O resto nunca sai do servidor.
  const report = full ? fullReport : toSummary(fullReport);

  // 6. Salva e marca o dia como ativo (o uso já foi contado na reserva).
  const { data: row, error } = await admin
    .from('linkedin_reports')
    .insert({
      user_id: userId,
      source: input.source,
      target_role: targetRole,
      is_full: full,
      report,
      overall_score: report.overall_score,
    })
    .select('id')
    .single();
  if (error) throw error;

  await admin
    .from('daily_activity')
    .upsert({ user_id: userId, activity_date: dateSP(new Date()) }, { onConflict: 'user_id,activity_date', ignoreDuplicates: true });

  console.log(
    JSON.stringify({ fn: 'analyze-linkedin', event: 'linkedin_analyzed', user_id: userId, report_id: row.id, full, source: input.source }),
  );
  // 7. Devolve o relatório.
  return ok({ report_id: row.id, is_full: full, report });
}

/** Baixa o PDF do Storage e extrai o texto. Arquivo ausente, grande demais ou quebrado → PDF_UNREADABLE. */
async function readPdf(admin: Admin, path: string): Promise<string> {
  const { data: blob, error } = await admin.storage.from(BUCKET).download(path);
  if (error || !blob) throw new AppError('INVALID_INPUT', 'Não encontramos o arquivo. Escolha o PDF de novo.');
  if (blob.size > PDF_MAX_BYTES) throw new AppError('INVALID_INPUT', 'O PDF passou de 5 MB. Escolha um arquivo menor.');

  try {
    const pdf = await getDocumentProxy(new Uint8Array(await blob.arrayBuffer()));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  } catch {
    // PDF protegido por senha, corrompido ou que não é PDF de verdade.
    console.log(JSON.stringify({ fn: 'analyze-linkedin', error: 'pdf_parse' }));
    throw new AppError('PDF_UNREADABLE', PDF_UNREADABLE_MESSAGE);
  }
}
