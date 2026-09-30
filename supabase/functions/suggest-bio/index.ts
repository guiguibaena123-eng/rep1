// "Me ajude a escrever" da T19: a IA sugere uma bio de 3 frases.
// Entrada: { name, age, goal, area, experiences, education } (o que está na tela, mesmo ainda não salvo)
// Saída: { bio }. Nada é salvo aqui: a pessoa decide se usa a sugestão.

import { adminClient, requireUser } from '../_shared/auth.ts';
import { bioInputSchema, buildBioPrompt, parseBio } from '../_shared/bio-logic.ts';
import { AppError, handler, ok } from '../_shared/http.ts';
import { langFromRequest, OUTPUT_LANGUAGE } from '../_shared/lang.ts';
import { checkRateLimit } from '../_shared/limits.ts';
import { createLLMClient, generateValidated } from '../_shared/llm.ts';

Deno.serve(
  handler('suggest-bio', async (req) => {
    const admin = adminClient();
    const user = await requireUser(req, admin);

    const parsed = bioInputSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new AppError('INVALID_INPUT', 'Confira os dados do perfil e tente de novo.');

    await checkRateLimit(admin, user.id, 'suggest-bio');

    const language = OUTPUT_LANGUAGE[langFromRequest(req)];
    const bio = await generateValidated(
      createLLMClient(),
      { ...buildBioPrompt(parsed.data, language), temperature: 0.6 },
      (raw) => parseBio(raw, language.code),
      'Não deu para criar a sugestão agora. Tente de novo.',
    );

    console.log(JSON.stringify({ fn: 'suggest-bio', event: 'bio_suggested', user_id: user.id }));
    return ok({ bio });
  }),
);
