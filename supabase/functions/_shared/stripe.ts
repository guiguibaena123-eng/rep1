// Acesso à API da Stripe (só no servidor, com STRIPE_SECRET_KEY).
// Regra de segurança: o Premium só é renovado com dados lidos AQUI, direto da API,
// nunca com o que chega no corpo de um aviso (que poderia ser falsificado).

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { AppError } from './http.ts';
import { mapSubscriptionStatus, periodEndIso, subscriptionIdOfInvoice } from './payment-logic.ts';

const STRIPE_API = 'https://api.stripe.com';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type StripeSubscription = {
  id: string;
  status?: string;
  metadata?: Record<string, string> | null;
  current_period_end?: number | null;
  items?: { data?: { current_period_end?: number | null }[] } | null;
};

export type StripeSession = {
  id: string;
  url?: string | null;
  status?: 'open' | 'complete' | 'expired' | null;
  subscription?: string | { id: string } | null;
  client_reference_id?: string | null;
};

export type StripeInvoice = {
  id: string;
  status?: string;
  amount_paid?: number;
  currency?: string;
  subscription?: unknown;
  parent?: { subscription_details?: { subscription?: unknown } | null } | null;
};

export function secretKey() {
  const k = Deno.env.get('STRIPE_SECRET_KEY');
  if (!k) throw new AppError('INTERNAL', 'O pagamento ainda não foi configurado.');
  return k;
}

/** Chamada à API. Erro → lança com o status e a mensagem da Stripe (sem dados do usuário). */
export async function stripe<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  params?: Record<string, string>,
  idempotencyKey?: string,
): Promise<T | null> {
  const query = params ? new URLSearchParams(params).toString() : '';
  const res = await fetch(`${STRIPE_API}${path}${method === 'GET' && query ? `?${query}` : ''}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: method === 'POST' && query ? query : undefined,
    signal: AbortSignal.timeout(15_000),
  });
  if (method === 'GET' && res.status === 404) return null;
  if (!res.ok) {
    const info = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: string } };
    // A mensagem da Stripe ajuda a achar erro de configuração (ex.: chave errada).
    // E-mails são apagados: nada pessoal vai para os logs.
    const msg = String(info.error?.message ?? info.error?.code ?? '').replace(/\S+@\S+/g, '[email]').slice(0, 160);
    throw new Error(`STRIPE_${res.status}: ${msg}`);
  }
  return (await res.json()) as T;
}

const idPath = (id: string) => encodeURIComponent(id);
export const fetchSubscription = (id: string) => stripe<StripeSubscription>('GET', `/v1/subscriptions/${idPath(id)}`);
export const fetchSession = (id: string) => stripe<StripeSession>('GET', `/v1/checkout/sessions/${idPath(id)}`);
export const fetchInvoice = (id: string) => stripe<StripeInvoice>('GET', `/v1/invoices/${idPath(id)}`);

/** Faturas PAGAS (cobranças mensais aprovadas) de uma assinatura. */
export async function listPaidInvoices(subscriptionId: string) {
  const data = await stripe<{ data?: StripeInvoice[] }>('GET', '/v1/invoices', {
    subscription: subscriptionId,
    status: 'paid',
    limit: '24',
  });
  return data?.data ?? [];
}

// ---------- Webhook criado automaticamente ----------
// Na 1ª assinatura, o servidor cria na Stripe o destino dos avisos (webhook) e guarda o segredo
// em app_settings. Um por modo: teste (sk_test_) e produção (sk_live_).
// Se o segredo STRIPE_WEBHOOK_SECRET for definido à mão no Supabase, ele vale e nada é criado.

/** Avisos que a Stripe manda para a função stripe-webhook. */
export const WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
];

const webhookSettingKey = () => (secretKey().includes('_live_') ? 'stripe_webhook_secret_live' : 'stripe_webhook_secret_test');
export const webhookUrl = () => `${Deno.env.get('SUPABASE_URL')}/functions/v1/stripe-webhook`;

/** Segredo para conferir a assinatura dos avisos (null = ainda não configurado). */
export async function webhookSecret(admin: SupabaseClient) {
  const manual = Deno.env.get('STRIPE_WEBHOOK_SECRET')?.trim();
  if (manual) return manual;
  const { data, error } = await admin.from('app_settings').select('value').eq('key', webhookSettingKey()).maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}

type WebhookEndpoint = { id: string; url?: string; secret?: string };

/** Cria o webhook na Stripe se ainda não existir. Só uma chamada por vez cria (a linha em app_settings é a "trava"). */
export async function ensureWebhookEndpoint(admin: SupabaseClient) {
  if (Deno.env.get('STRIPE_WEBHOOK_SECRET')?.trim()) return;
  const key = webhookSettingKey();

  const { data: row, error } = await admin.from('app_settings').select('value, created_at').eq('key', key).maybeSingle();
  if (error) throw error;
  if (row?.value) return;
  // Trava esquecida (uma criação que caiu no meio): libera depois de 2 minutos.
  if (row && Date.now() - new Date(row.created_at).getTime() < 120_000) return;
  if (row) await admin.from('app_settings').delete().eq('key', key).is('value', null);

  // Pega a trava: se outra chamada pegou primeiro, ela é que cria.
  const { data: claimed, error: claimError } = await admin
    .from('app_settings')
    .upsert({ key, value: null }, { onConflict: 'key', ignoreDuplicates: true })
    .select('key');
  if (claimError) throw claimError;
  if (!claimed?.length) return;

  try {
    const url = webhookUrl();
    // Destinos antigos para a mesma função (sem segredo guardado) são trocados por um novo.
    const list = await stripe<{ data?: WebhookEndpoint[] }>('GET', '/v1/webhook_endpoints', { limit: '100' });
    for (const ep of list?.data ?? []) {
      if (ep.url === url) await stripe('DELETE', `/v1/webhook_endpoints/${idPath(ep.id)}`);
    }
    const params: Record<string, string> = { url, description: 'Siwki: renovação do Premium (criado automaticamente)' };
    WEBHOOK_EVENTS.forEach((ev, i) => (params[`enabled_events[${i}]`] = ev));
    const created = await stripe<WebhookEndpoint>('POST', '/v1/webhook_endpoints', params);
    if (!created?.secret) throw new Error('STRIPE_NO_WEBHOOK_SECRET');

    const { error: saveError } = await admin.from('app_settings').update({ value: created.secret }).eq('key', key);
    if (saveError) throw saveError;
    console.log(JSON.stringify({ fn: 'stripe', event: 'webhook_created', mode: key.endsWith('live') ? 'live' : 'test' }));
  } catch (err) {
    await admin.from('app_settings').delete().eq('key', key).is('value', null);
    throw err;
  }
}

const sessionSubscriptionId = (s: StripeSession) =>
  typeof s.subscription === 'string' ? s.subscription : (s.subscription?.id ?? null);

/** Cancela a assinatura na Stripe na hora (sem novas cobranças). Já cancelada → nada a fazer. */
export async function cancelAtStripe(subscriptionId: string) {
  const sub = await fetchSubscription(subscriptionId);
  if (!sub || sub.status === 'canceled' || sub.status === 'incomplete_expired') return;
  await stripe('DELETE', `/v1/subscriptions/${idPath(subscriptionId)}`);
}

/**
 * Id guardado na nossa tabela → assinatura da Stripe.
 * Antes do pagamento guardamos o id da página de pagamento (cs_...); depois, o da assinatura (sub_...).
 * Devolve null se a pessoa ainda não concluiu. Página expirada → marca a nossa linha como cancelada.
 */
export async function resolveSubscriptionId(admin: SupabaseClient, ourId: string, providerId: string) {
  if (providerId.startsWith('sub_')) return providerId;
  if (!providerId.startsWith('cs_')) return null;
  const session = await fetchSession(providerId);
  if (!session) return null;
  const subId = sessionSubscriptionId(session);
  if (subId) return subId;
  if (session.status === 'expired') {
    const now = new Date().toISOString();
    await admin.from('subscriptions').update({ status: 'cancelled', cancelled_at: now, updated_at: now }).eq('id', ourId).eq('status', 'pending');
  }
  return null;
}

/** Aplica uma fatura paga a uma assinatura nossa. Devolve true se renovou o Premium agora. */
async function applyInvoice(admin: SupabaseClient, ourId: string, inv: StripeInvoice) {
  // Fatura de R$ 0 (1ª cobrança adiada para o fim do Premium atual): não é pagamento.
  if (inv.status !== 'paid' || !inv.amount_paid || inv.amount_paid <= 0) return false;
  const { data, error } = await admin.rpc('apply_subscription_charge', {
    p_subscription: ourId,
    p_provider_payment_id: inv.id,
    p_status: 'approved',
    p_amount: typeof inv.amount_paid === 'number' ? inv.amount_paid / 100 : null,
    p_currency: inv.currency ? inv.currency.toUpperCase() : null,
    p_payment_type: 'card',
  });
  if (error) throw error;
  return data === true;
}

/**
 * Sincroniza UMA assinatura da Stripe com a nossa tabela: status, próxima cobrança e faturas pagas.
 * Tudo é lido na API. Se a assinatura não for de ninguém aqui (ex.: conta apagada), é cancelada.
 * Devolve { ours, renewed }.
 */
export async function syncStripeSubscription(admin: SupabaseClient, stripeSubId: string) {
  const sub = await fetchSubscription(stripeSubId);
  if (!sub) return { ours: null, renewed: false };

  const status = mapSubscriptionStatus(sub.status);
  const ref = sub.metadata?.subscription_id ?? '';
  const { data: row, error } = UUID.test(ref)
    ? await admin.from('subscriptions').select('id').eq('id', ref).maybeSingle()
    : await admin.from('subscriptions').select('id').eq('provider_subscription_id', sub.id).maybeSingle();
  if (error) throw error;

  if (!row) {
    // Assinatura sem dona (conta apagada no meio do pagamento): não deixa a Stripe continuar cobrando.
    if (status === 'authorized' || status === 'paused') await cancelAtStripe(sub.id);
    return { ours: null, renewed: false };
  }

  if (status) {
    const now = new Date().toISOString();
    const { error: updError } = await admin
      .from('subscriptions')
      .update({
        provider_subscription_id: sub.id,
        status,
        next_payment_date: status === 'cancelled' ? null : periodEndIso(sub),
        updated_at: now,
        ...(status === 'cancelled' ? { cancelled_at: now } : {}),
      })
      .eq('id', row.id);
    if (updError) throw updError;
  }

  // Cobranças já feitas: aplica cada uma (a função do banco não aplica duas vezes).
  let renewed = false;
  for (const inv of await listPaidInvoices(sub.id)) {
    if (await applyInvoice(admin, row.id, inv)) renewed = true;
  }
  return { ours: row.id as string, renewed };
}

/** Uma fatura (aviso invoice.*) → sincroniza a assinatura dela. */
export async function syncFromInvoice(admin: SupabaseClient, invoiceId: string) {
  const inv = await fetchInvoice(invoiceId);
  const subId = inv ? subscriptionIdOfInvoice(inv) : null;
  return subId ? syncStripeSubscription(admin, subId) : { ours: null, renewed: false };
}

/** Uma página de pagamento concluída (aviso checkout.session.completed) → sincroniza a assinatura criada. */
export async function syncFromSession(admin: SupabaseClient, sessionId: string) {
  const session = await fetchSession(sessionId);
  const subId = session ? sessionSubscriptionId(session) : null;
  return subId ? syncStripeSubscription(admin, subId) : { ours: null, renewed: false };
}
