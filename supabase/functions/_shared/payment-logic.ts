// Regras da assinatura do Premium na Stripe (renovação automática mensal), sem acesso à rede.
// Sem imports locais: os testes do app (Jest) importam este arquivo direto.

/** Preço padrão se o segredo PREMIUM_PRICE não for definido (em reais, por mês). */
export const DEFAULT_PRICE = 14.9;
/** Tolerância do aviso assinado da Stripe: mais velho que isso é recusado (evita reenvio de aviso antigo). */
export const SIGNATURE_TOLERANCE_S = 300;

/** Segredo PREMIUM_PRICE ("14.90" ou "14,90") → número com 2 casas. Inválido → preço padrão. */
export function parsePrice(raw: string | undefined | null): number {
  const n = Number((raw ?? '').trim().replace(',', '.'));
  if (!Number.isFinite(n) || n < 1 || n > 1000) return DEFAULT_PRICE;
  return Math.round(n * 100) / 100;
}

/** Reais → centavos (a Stripe trabalha em centavos). */
export const toCents = (reais: number) => Math.round(reais * 100);

/** A Stripe só aceita adiar a 1ª cobrança (trial_end) para pelo menos 48 horas depois. Usamos 49 de folga. */
export const MIN_DEFER_MS = 49 * 60 * 60 * 1000;

/**
 * Quem ainda tem Premium pago (ex.: cancelou e quer reativar) não paga de novo agora:
 * a 1ª cobrança fica para quando o Premium atual acaba. Devolve essa data em segundos (ou null = cobra agora).
 */
export function firstChargeAt(premiumUntil: string | null | undefined, nowMs: number): number | null {
  const until = premiumUntil ? new Date(premiumUntil).getTime() : NaN;
  if (!Number.isFinite(until) || until - nowMs < MIN_DEFER_MS) return null;
  return Math.floor(until / 1000);
}

export type CheckoutInput = {
  subscriptionId: string;
  userId: string;
  email: string;
  price: number;
  /** Página para onde a Stripe leva a pessoa no fim (a nossa função de aviso responde um texto curto). */
  returnUrl: string;
  /** Adia a 1ª cobrança para esta data (segundos). Ver firstChargeAt. */
  firstChargeAt?: number | null;
  /** Idioma da página de pagamento (a Stripe aceita os 5 do app). Sem ele: pt-BR. */
  locale?: string;
};

/**
 * Parâmetros do POST /v1/checkout/sessions (formato de formulário, como a Stripe pede):
 * a pessoa cadastra o cartão na página da Stripe e ela cobra sozinha todo mês.
 * O nosso id vai em client_reference_id e nos metadados da assinatura (para ligar os avisos).
 */
export function buildCheckoutSession(input: CheckoutInput): Record<string, string> {
  return {
    mode: 'subscription',
    locale: input.locale ?? 'pt-BR',
    customer_email: input.email,
    client_reference_id: input.subscriptionId,
    success_url: `${input.returnUrl}?retorno=ok`,
    cancel_url: `${input.returnUrl}?retorno=cancelado`,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'brl',
    'line_items[0][price_data][unit_amount]': String(toCents(input.price)),
    'line_items[0][price_data][recurring][interval]': 'month',
    'line_items[0][price_data][product_data][name]': 'Siwki Premium (mensal)',
    'metadata[subscription_id]': input.subscriptionId,
    'subscription_data[metadata][subscription_id]': input.subscriptionId,
    'subscription_data[metadata][user_id]': input.userId,
    ...(input.firstChargeAt ? { 'subscription_data[trial_end]': String(input.firstChargeAt) } : {}),
  };
}

/**
 * Status de uma assinatura na Stripe → status da tabela subscriptions (desconhecido → null).
 * past_due = cobrança falhou e a Stripe ainda está tentando de novo: continua valendo.
 * unpaid = a Stripe desistiu de cobrar, mas a assinatura existe: fica "pausada" até cancelar.
 */
export function mapSubscriptionStatus(stripe: unknown) {
  switch (stripe) {
    case 'incomplete':
      return 'pending' as const;
    case 'active':
    case 'trialing':
    case 'past_due':
      return 'authorized' as const;
    case 'paused':
    case 'unpaid':
      return 'paused' as const;
    case 'canceled':
    case 'incomplete_expired':
      return 'cancelled' as const;
    default:
      return null;
  }
}

type InvoiceLike = {
  subscription?: unknown;
  parent?: { subscription_details?: { subscription?: unknown } | null } | null;
};

/** De qual assinatura é uma fatura? (versões novas da API: parent.subscription_details; antigas: subscription). */
export function subscriptionIdOfInvoice(inv: InvoiceLike): string | null {
  const raw = inv.parent?.subscription_details?.subscription ?? inv.subscription;
  const id = typeof raw === 'string' ? raw : raw && typeof raw === 'object' && 'id' in raw ? (raw as { id: unknown }).id : null;
  return typeof id === 'string' && /^sub_[A-Za-z0-9]{1,250}$/.test(id) ? id : null;
}

type SubscriptionLike = {
  current_period_end?: number | null;
  items?: { data?: { current_period_end?: number | null }[] } | null;
};

/** Fim do período atual (= próxima cobrança), em ISO. Versões novas da API guardam isso em cada item. */
export function periodEndIso(sub: SubscriptionLike): string | null {
  const ts = sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end;
  return typeof ts === 'number' && ts > 0 ? new Date(ts * 1000).toISOString() : null;
}

/** Cabeçalho Stripe-Signature ("t=1492774577,v1=5257a8...,v0=...") → { t, v1: [...] }. */
export function parseStripeSignature(header: string | null) {
  const out: { t?: string; v1: string[] } = { v1: [] };
  for (const part of (header ?? '').split(',')) {
    const [key, value] = part.split('=').map((s) => s?.trim());
    if (key === 't' && value) out.t = value;
    if (key === 'v1' && value) out.v1.push(value);
  }
  return out;
}

/** O aviso é recente? (t em segundos; relógio atual em milissegundos.) */
export function isFreshTimestamp(t: string | undefined, nowMs: number, toleranceS = SIGNATURE_TOLERANCE_S) {
  const ts = Number(t);
  return Number.isFinite(ts) && Math.abs(nowMs / 1000 - ts) <= toleranceS;
}

/** Compara duas assinaturas em tempo constante (não "vaza" onde a diferença começa). */
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
