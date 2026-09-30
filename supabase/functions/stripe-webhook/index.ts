// Recebe os avisos da Stripe sobre a assinatura do Premium e renova o Premium a cada cobrança paga.
// Esta função é PÚBLICA (a Stripe não tem login): verify_jwt = false no supabase/config.toml.
// Avisos tratados (marque estes na Stripe):
//  - checkout.session.completed: a pessoa concluiu a página de pagamento → liga a assinatura à nossa linha.
//  - customer.subscription.updated / .deleted: a assinatura mudou (ativa, atrasada, cancelada).
//  - invoice.paid: saiu uma cobrança mensal paga → renova o Premium.
// GET (?retorno=ok|cancelado): é a página para onde a Stripe leva a pessoa no fim; só pede para voltar ao app.
// Segurança:
//  1. O aviso precisa vir assinado pela Stripe e ser recente. O segredo é o STRIPE_WEBHOOK_SECRET (se definido
//     à mão) ou o guardado em app_settings quando o servidor criou o webhook sozinho (ver ensureWebhookEndpoint).
//  2. Tudo é sempre CONSULTADO na API da Stripe com a nossa chave: um aviso falso não renova nada.

import { adminClient } from '../_shared/auth.ts';
import { isFreshTimestamp, parseStripeSignature, safeEqual } from '../_shared/payment-logic.ts';
import { syncFromInvoice, syncFromSession, syncStripeSubscription, webhookSecret } from '../_shared/stripe.ts';

async function hmacHex(secret: string, text: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const log = (data: Record<string, unknown>) => console.log(JSON.stringify({ fn: 'stripe-webhook', ...data }));

/** Anota em app_settings o último aviso aceito/recusado (tipo e hora, nada pessoal), para conferir sem abrir a Stripe. */
async function trace(admin: ReturnType<typeof adminClient>, key: 'stripe_webhook_last_ok' | 'stripe_webhook_last_error', info: string) {
  await admin
    .from('app_settings')
    .upsert({ key, value: `${new Date().toISOString()} ${info}`.slice(0, 200) }, { onConflict: 'key' })
    .then(() => {}, () => {});
}

const text = (body: string) => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

const ID = /^[A-Za-z0-9_]{1,255}$/;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    const back = new URL(req.url).searchParams.get('retorno');
    if (back === 'cancelado') return text('Assinatura não concluída. Nada foi cobrado.\n\nPode fechar esta página e voltar para o app Siwki.');
    return text('Tudo certo! Recebemos sua assinatura.\n\nPode fechar esta página e voltar para o app Siwki.');
  }

  // 1. Assinatura do aviso (obrigatória): texto assinado = "{t}.{corpo exato}".
  const admin = adminClient();
  const secret = await webhookSecret(admin).catch(() => null);
  if (!secret) {
    log({ error: 'NO_WEBHOOK_SECRET' });
    return new Response('not configured', { status: 500 });
  }
  const raw = await req.text();
  const { t, v1 } = parseStripeSignature(req.headers.get('stripe-signature'));
  const expected = t ? await hmacHex(secret, `${t}.${raw}`) : '';
  if (!t || !isFreshTimestamp(t, Date.now()) || !v1.some((sig) => safeEqual(expected, sig))) {
    log({ error: 'BAD_SIGNATURE' });
    return new Response('invalid signature', { status: 400 });
  }

  let event: { type?: string; data?: { object?: { id?: unknown } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('bad body', { status: 400 });
  }
  const type = event.type ?? '';
  const objectId = typeof event.data?.object?.id === 'string' ? event.data.object.id : '';
  if (!ID.test(objectId)) return new Response('ignored');

  // 2. Consulta de verdade e aplica.
  try {
    let result: { ours: string | null; renewed: boolean } | null = null;
    if (type === 'checkout.session.completed') result = await syncFromSession(admin, objectId);
    else if (type.startsWith('customer.subscription.')) result = await syncStripeSubscription(admin, objectId);
    else if (type === 'invoice.paid' || type === 'invoice.payment_succeeded') result = await syncFromInvoice(admin, objectId);
    else return new Response('ignored');

    log({ event: result.renewed ? 'premium_renewed' : 'subscription_synced', type, ours: !!result.ours });
    await trace(admin, 'stripe_webhook_last_ok', `${type}${result.renewed ? ' (renovou)' : ''}`);
    return new Response('ok');
  } catch (err) {
    // 500: a Stripe tenta de novo mais tarde.
    log({ error: 'INTERNAL', type, detail: (err as Error)?.message });
    await trace(admin, 'stripe_webhook_last_error', `${type}: ${(err as Error)?.message ?? ''}`);
    return new Response('error', { status: 500 });
  }
});
