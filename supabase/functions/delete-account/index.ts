// Apaga a conta do usuário logado: arquivos no Storage e o usuário (o resto some em cascata).
// Idempotente: chamar de novo depois de apagado não dá erro.

import { adminClient, requireUser } from '../_shared/auth.ts';
import { AppError, handler, ok } from '../_shared/http.ts';
import { cancelAtStripe, fetchSession, stripe } from '../_shared/stripe.ts';

/** Buckets que podem ter arquivos do usuário, sempre na pasta {user_id}/. */
const USER_BUCKETS = ['linkedin-uploads', 'avatars'];

Deno.serve(
  handler('delete-account', async (req) => {
    const admin = adminClient();
    const user = await requireUser(req, admin);

    // Assinatura ativa: cancela na Stripe ANTES de apagar (senão ela continuaria cobrando).
    // Página de pagamento ainda aberta: fecha (ou, se já foi paga, cancela a assinatura criada).
    // Se não der para cancelar, não apaga a conta: a pessoa tenta de novo.
    const { data: subs } = await admin
      .from('subscriptions')
      .select('provider_subscription_id')
      .eq('user_id', user.id)
      .eq('provider', 'stripe')
      .in('status', ['authorized', 'paused', 'pending']);
    for (const sub of subs ?? []) {
      const id = sub.provider_subscription_id;
      if (!id) continue;
      try {
        if (id.startsWith('sub_')) {
          await cancelAtStripe(id);
        } else if (id.startsWith('cs_')) {
          const session = await fetchSession(id);
          if (session?.status === 'open') await stripe('POST', `/v1/checkout/sessions/${encodeURIComponent(id)}/expire`);
          const created = typeof session?.subscription === 'string' ? session.subscription : session?.subscription?.id;
          if (created) await cancelAtStripe(created);
        }
      } catch (err) {
        console.error(JSON.stringify({ fn: 'delete-account', error: 'STRIPE_CANCEL', detail: (err as Error)?.message }));
        throw new AppError('INTERNAL', 'Não conseguimos cancelar sua assinatura agora. Tente apagar a conta de novo em alguns minutos.');
      }
    }

    for (const bucket of USER_BUCKETS) {
      const { data: files, error } = await admin.storage.from(bucket).list(user.id, { limit: 1000 });
      // Bucket ainda não existe (antes da Fase 5) ou pasta vazia: nada a apagar.
      if (error || !files?.length) continue;
      await admin.storage.from(bucket).remove(files.map((f) => `${user.id}/${f.name}`));
    }

    const { error } = await admin.auth.admin.deleteUser(user.id);
    // Se já tinha sido apagado, consideramos sucesso.
    if (error && error.status !== 404) throw error;

    console.log(JSON.stringify({ fn: 'delete-account', event: 'deleted', user_id: user.id }));
    return ok({ deleted: true });
  }),
);
