// Plano B do aviso automático: o app pergunta "minha assinatura já foi aprovada?".
// O servidor consulta a assinatura e as faturas na Stripe e renova o Premium se houver cobrança paga.
// Entrada: { subscription_id }  →  Saída: { status, premium }

import { adminClient, requireUser } from '../_shared/auth.ts';
import { AppError, handler, ok } from '../_shared/http.ts';
import { checkRateLimit, loadPremium } from '../_shared/limits.ts';
import { resolveSubscriptionId, syncStripeSubscription } from '../_shared/stripe.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(
  handler('check-subscription', async (req) => {
    const admin = adminClient();
    const user = await requireUser(req, admin);

    const { subscription_id } = (await req.json().catch(() => ({}))) as { subscription_id?: unknown };
    if (typeof subscription_id !== 'string' || !UUID.test(subscription_id)) {
      throw new AppError('INVALID_INPUT', 'Assinatura não encontrada.');
    }

    // Só a dona da assinatura pode perguntar por ela.
    const { data: row, error } = await admin
      .from('subscriptions')
      .select('provider_subscription_id')
      .eq('id', subscription_id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new AppError('INVALID_INPUT', 'Assinatura não encontrada.');

    await checkRateLimit(admin, user.id, 'check-subscription');

    if (row.provider_subscription_id) {
      const stripeSubId = await resolveSubscriptionId(admin, subscription_id, row.provider_subscription_id);
      if (stripeSubId) await syncStripeSubscription(admin, stripeSubId);
    }

    const { data: after, error: afterError } = await admin
      .from('subscriptions')
      .select('status')
      .eq('id', subscription_id)
      .single();
    if (afterError) throw afterError;
    return ok({ status: after.status, premium: await loadPremium(admin, user.id) });
  }),
);
