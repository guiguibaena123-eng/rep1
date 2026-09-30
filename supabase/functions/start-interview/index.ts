// Começa uma simulação: confere o limite do plano, pede as perguntas à IA e cria a sessão.
// Entrada: { area, level, num_questions }  →  Saída: { session_id, questions }

import { adminClient, requireUser } from '../_shared/auth.ts';
import { AppError, handler, ok } from '../_shared/http.ts';
import { buildQuestionsPrompt, parseQuestions, startInputSchema, type Question } from '../_shared/interview-logic.ts';
import { langFromRequest, OUTPUT_LANGUAGE } from '../_shared/lang.ts';
import { checkRateLimit, releaseUsage, reserveInterview } from '../_shared/limits.ts';
import { createLLMClient, generateValidated } from '../_shared/llm.ts';

Deno.serve(
  handler('start-interview', async (req) => {
    const admin = adminClient();
    const user = await requireUser(req, admin);

    const input = startInputSchema.safeParse(await req.json().catch(() => null));
    if (!input.success) throw new AppError('INVALID_INPUT', 'Escolha a área, o nível e o número de perguntas.');
    const { area, level, num_questions } = input.data;

    await checkRateLimit(admin, user.id, 'start-interview');

    // 1. Reserva a vaga do plano (antes de gastar a IA; pedidos simultâneos não furam o limite).
    const reservations = await reserveInterview(admin, user.id);

    let session: { id: string };
    let questions: Question[];
    try {
      // 2 e 3. Perguntas da IA, validadas (1 nova tentativa se vierem erradas).
      questions = await generateValidated(
        createLLMClient(),
        {
          ...buildQuestionsPrompt({ area, level, num: num_questions, language: OUTPUT_LANGUAGE[langFromRequest(req)] }),
          temperature: 0.5,
        },
        (raw) => parseQuestions(raw, num_questions),
        'Não conseguimos montar as perguntas agora. Tente de novo.',
      );

      // 4. Cria a sessão.
      const { data, error } = await admin
        .from('interview_sessions')
        .insert({ user_id: user.id, area, level, num_questions, questions, status: 'in_progress' })
        .select('id')
        .single();
      if (error) throw error;
      session = data;
    } catch (err) {
      // 5. Deu errado: devolve a vaga (a pessoa não perde a simulação da semana).
      await releaseUsage(admin, user.id, reservations);
      throw err;
    }

    console.log(JSON.stringify({ fn: 'start-interview', event: 'interview_started', user_id: user.id, session_id: session.id }));
    return ok({ session_id: session.id, questions });
  }),
);
