// Envia as respostas e gera o feedback da simulação.
// Entrada: { session_id, answers?: [{ question_id, answer_text }] }  →  Saída: { report, overall_score }
// Se a IA falhar, a sessão continua "in_progress" com as respostas salvas: o app pode tentar de novo
// sem a pessoa reescrever nada e sem gastar outra simulação.

import { adminClient, requireUser } from '../_shared/auth.ts';
import { AppError, handler, ok } from '../_shared/http.ts';
import {
  buildFeedbackPrompt,
  checkAnswers,
  dateSP,
  parseFeedback,
  submitInputSchema,
  type Answer,
  type Area,
  type Level,
  type Question,
  type Report,
} from '../_shared/interview-logic.ts';
import { langFromRequest, OUTPUT_LANGUAGE } from '../_shared/lang.ts';
import { checkRateLimit } from '../_shared/limits.ts';
import { createLLMClient, generateValidated } from '../_shared/llm.ts';

Deno.serve(
  handler('submit-interview', async (req) => {
    const admin = adminClient();
    const user = await requireUser(req, admin);

    const input = submitInputSchema.safeParse(await req.json().catch(() => null));
    if (!input.success) throw new AppError('INVALID_INPUT', 'Não encontramos essa simulação.');

    await checkRateLimit(admin, user.id, 'submit-interview');

    // 1. A sessão é desta pessoa e ainda está em andamento?
    const { data: session, error: sessionError } = await admin
      .from('interview_sessions')
      .select('id, user_id, area, level, status, questions')
      .eq('id', input.data.session_id)
      .maybeSingle();
    if (sessionError) throw sessionError;
    if (!session || session.user_id !== user.id) throw new AppError('INVALID_INPUT', 'Não encontramos essa simulação.');

    if (session.status === 'completed') {
      // Já tem feedback (ex.: o app caiu depois de gerar): devolve o mesmo, sem chamar a IA de novo.
      const { data: done } = await admin.from('interview_feedback').select('report, overall_score').eq('session_id', session.id).single();
      if (done) return ok(done);
    }
    if (session.status !== 'in_progress') throw new AppError('INVALID_INPUT', 'Essa simulação foi encerrada.');

    const questions = session.questions as Question[];

    // 2. Respostas: as enviadas agora ou, no "Tentar de novo", as já salvas.
    let answers: Answer[];
    if (input.data.answers?.length) {
      const valid = new Set(questions.map((q) => q.id));
      answers = input.data.answers
        .filter((a) => valid.has(a.question_id))
        .map((a) => ({ question_id: a.question_id, answer_text: a.answer_text.trim() }));
    } else {
      const { data, error } = await admin
        .from('interview_answers')
        .select('question_id, answer_text')
        .eq('session_id', session.id);
      if (error) throw error;
      answers = data ?? [];
    }

    const problem = checkAnswers(questions, answers);
    if (problem) throw new AppError('INVALID_INPUT', problem);

    // 3. Salva as respostas antes de chamar a IA.
    if (input.data.answers?.length) {
      const rows = answers.map((a) => ({ ...a, session_id: session.id, user_id: user.id }));
      const { error } = await admin.from('interview_answers').upsert(rows, { onConflict: 'session_id,question_id' });
      if (error) throw error;
    }

    // 4. Feedback da IA, validado (1 nova tentativa).
    const feedback = await generateValidated(
      createLLMClient(),
      {
        ...buildFeedbackPrompt({
          area: session.area as Area,
          level: session.level as Level,
          questions,
          answers,
          language: OUTPUT_LANGUAGE[langFromRequest(req)],
        }),
        temperature: 0.3,
      },
      (raw) => parseFeedback(raw, questions),
      'Não conseguimos gerar seu feedback agora. Suas respostas estão salvas: tente de novo.',
    );

    // 5. Salva o relatório (com as perguntas, para a T9 não precisar de outra consulta) e conclui a sessão.
    const report: Report = { ...feedback, questions };
    const { error: feedbackError } = await admin
      .from('interview_feedback')
      .upsert({ session_id: session.id, user_id: user.id, report, overall_score: feedback.overall_score }, { onConflict: 'session_id' });
    if (feedbackError) throw feedbackError;

    const { error: updateError } = await admin
      .from('interview_sessions')
      .update({ status: 'completed', overall_score: feedback.overall_score, completed_at: new Date().toISOString() })
      .eq('id', session.id);
    if (updateError) throw updateError;

    // 6. Marca o dia como ativo (sequência de dias).
    await admin
      .from('daily_activity')
      .upsert({ user_id: user.id, activity_date: dateSP(new Date()) }, { onConflict: 'user_id,activity_date', ignoreDuplicates: true });

    console.log(JSON.stringify({ fn: 'submit-interview', event: 'interview_completed', user_id: user.id, session_id: session.id }));
    return ok({ report, overall_score: feedback.overall_score });
  }),
);
