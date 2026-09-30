// Cancela a renovação automática. REGRA: o Premium continua até o fim do período já pago
// (profiles.premium_until não muda); só não haverá novas cobranças.
// Entrada: {}  →  Saída: { premium_until }

import { adminClient, requireUser } from '../_shared/auth.ts';
import { AppError, handler, ok } from '../_shared/http.ts';
import { checkRateLimit } from '../_shared/limits.ts';
import { cancelAtStripe } from '../_shared/stripe.ts';

Deno.serve(
  handler('cancel-subscription', async (req) => {
    const admin = adminClient();
    const user = await requireUser(req, admin);
    await checkRateLimit(admin, user.id, 'cancel-subscription');

    const { data: sub, error } = await admin
      .from('subscriptions')
      .select('id, provider_subscription_id')
      .eq('user_id', user.id)
      .in('status', ['authorized', 'paused'])
      .maybeSingle();
    if (error) throw error;
    if (!sub) throw new AppError('INVALID_INPUT', 'Você não tem uma assinatura ativa.');

    if (sub.provider_subscription_id?.startsWith('sub_')) {
      try {
        await cancelAtStripe(sub.provider_subscription_id);
      } catch (err) {
        console.error(JSON.stringify({ fn: 'cancel-subscription', error: 'STRIPE_CANCEL', detail: (err as Error)?.message }));
        throw new AppError('INTERNAL', 'Não conseguimos cancelar agora. Tente de novo em alguns segundos.');
      }
    }

    const now = new Date().toISOString();
    const { error: updError } = await admin
      .from('subscriptions')
      .update({ status: 'cancelled', cancelled_at: now, updated_at: now })
      .eq('id', sub.id);
    if (updError) throw updError;

    const { data: profile } = await admin.from('profiles').select('premium_until').eq('id', user.id).single();
    console.log(JSON.stringify({ fn: 'cancel-subscription', event: 'subscription_cancelled', user_id: user.id }));
    return ok({ premium_until: profile?.premium_until ?? null });
  }),
);
