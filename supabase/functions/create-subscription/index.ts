// Cria a assinatura mensal do Premium na Stripe (renovação automática).
// Entrada: {}  →  Saída: { subscription_id, checkout_url }
// O preço vem do SERVIDOR (segredo PREMIUM_PRICE), nunca do app.

import { adminClient, requireUser } from '../_shared/auth.ts';
import { AppError, handler, ok } from '../_shared/http.ts';
import { langFromRequest } from '../_shared/lang.ts';
import { checkRateLimit } from '../_shared/limits.ts';
import { buildCheckoutSession, firstChargeAt, parsePrice } from '../_shared/payment-logic.ts';
import {
  ensureWebhookEndpoint,
  fetchSession,
  secretKey,
  stripe,
  syncStripeSubscription,
  type StripeSession,
} from '../_shared/stripe.ts';

const FAILED = 'Não conseguimos abrir a assinatura agora. Tente de novo em alguns segundos.';
const OPENING = 'Já estamos abrindo sua página de pagamento. Espere alguns segundos.';
const ALREADY = 'Você já tem uma assinatura ativa.';

/**
 * Fecha as páginas de pagamento anteriores desta pessoa que ainda estão "pending".
 * - Já foi paga → sincroniza (a assinatura vira ativa) e recusa uma nova.
 * - Ainda aberta → expira na Stripe (não pode mais ser paga) e marca como cancelada.
 * - Sendo criada agora por outro pedido (sem id da Stripe, menos de 1 minuto) → recusa.
 */
async function closePendingCheckouts(admin: ReturnType<typeof adminClient>, userId: string) {
  const { data: pending, error } = await admin
    .from('subscriptions')
    .select('id, provider_subscription_id, created_at')
    .eq('user_id', userId)
    .eq('status', 'pending');
  if (error) throw error;

  for (const row of pending ?? []) {
    const providerId: string | null = row.provider_subscription_id;
    if (!providerId && Date.now() - new Date(row.created_at).getTime() < 60_000) {
      throw new AppError('INVALID_INPUT', OPENING);
    }
    if (providerId?.startsWith('sub_')) {
      await syncStripeSubscription(admin, providerId);
      throw new AppError('INVALID_INPUT', ALREADY);
    }
    if (providerId?.startsWith('cs_')) {
      const session = await fetchSession(providerId);
      const paidSub = typeof session?.subscription === 'string' ? session.subscription : session?.subscription?.id;
      if (paidSub) {
        await syncStripeSubscription(admin, paidSub);
        throw new AppError('INVALID_INPUT', ALREADY);
      }
      // Se a pessoa pagar exatamente agora, a Stripe recusa o "expire" e cai no erro genérico: basta tentar de novo.
      if (session?.status === 'open') await stripe('POST', `/v1/checkout/sessions/${encodeURIComponent(providerId)}/expire`);
    }
    const now = new Date().toISOString();
    const { error: updError } = await admin
      .from('subscriptions')
      .update({ status: 'cancelled', cancelled_at: now, updated_at: now })
      .eq('id', row.id)
      .eq('status', 'pending');
    if (updError) throw updError;
  }
}

Deno.serve(
  handler('create-subscription', async (req) => {
    const admin = adminClient();
    const user = await requireUser(req, admin);
    secretKey(); // falha cedo, com mensagem clara, se a chave não estiver configurada
    if (!user.email) throw new AppError('INVALID_INPUT', 'Sua conta precisa de um e-mail para assinar.');

    await checkRateLimit(admin, user.id, 'create-subscription');

    const { data: active, error: activeError } = await admin
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['authorized', 'paused'])
      .maybeSingle();
    if (activeError) throw activeError;
    if (active) throw new AppError('INVALID_INPUT', ALREADY);

    // Página de pagamento anterior ainda aberta: fecha antes de abrir outra (evita cobrança dobrada).
    await closePendingCheckouts(admin, user.id);

    // 1ª assinatura: cria sozinho o webhook na Stripe. Se falhar, a assinatura segue
    // (o app confere pelo plano B) e tenta de novo na próxima.
    await ensureWebhookEndpoint(admin).catch((err) =>
      console.error(JSON.stringify({ fn: 'create-subscription', error: 'STRIPE_WEBHOOK_SETUP', detail: (err as Error)?.message })),
    );

    const price = parsePrice(Deno.env.get('PREMIUM_PRICE'));

    // Ainda tem Premium pago (ex.: cancelou e reativou): a 1ª cobrança só quando ele acabar.
    const { data: profile, error: profileError } = await admin.from('profiles').select('premium_until').eq('id', user.id).single();
    if (profileError) throw profileError;
    const deferTo = firstChargeAt(profile.premium_until, Date.now());

    const { data: sub, error } = await admin
      .from('subscriptions')
      .insert({ user_id: user.id, amount: price, provider: 'stripe' })
      .select('id')
      .single();
    // 23505: outro pedido desta pessoa abriu a página ao mesmo tempo (índice subscriptions_one_pending).
    if (error?.code === '23505') throw new AppError('INVALID_INPUT', OPENING);
    if (error) throw error;

    // No fim, a Stripe leva a pessoa para a nossa função de aviso, que só mostra "pode voltar para o app".
    const returnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/stripe-webhook`;

    try {
      const session = await stripe<StripeSession>(
        'POST',
        '/v1/checkout/sessions',
        buildCheckoutSession({
          subscriptionId: sub.id,
          userId: user.id,
          email: user.email,
          price,
          returnUrl,
          firstChargeAt: deferTo,
          locale: langFromRequest(req),
        }),
        sub.id,
      );
      if (!session?.url) throw new Error('STRIPE_NO_URL');

      // Até a pessoa pagar, guardamos o id da página de pagamento (cs_...); depois vira o da assinatura (sub_...).
      await admin.from('subscriptions').update({ provider_subscription_id: session.id }).eq('id', sub.id);
      console.log(JSON.stringify({ fn: 'create-subscription', event: 'subscription_started', user_id: user.id, subscription_id: sub.id }));
      return ok({ subscription_id: sub.id, checkout_url: session.url });
    } catch (err) {
      // Loga o motivo da Stripe (sem dados pessoais) para achar erro de configuração.
      console.error(JSON.stringify({ fn: 'create-subscription', error: 'STRIPE_CHECKOUT', detail: (err as Error)?.message }));
      await admin.from('subscriptions').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', sub.id);
      throw new AppError('INTERNAL', FAILED);
    }
  }),
);
