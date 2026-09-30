/** Regras simples do Premium manual (T16/T17), sem dependência de tela, para testar fácil. */

import { getLanguage, t, type Lang } from '@/i18n';

/** Preço padrão (em reais) se o .env não tiver um número válido. Igual ao DEFAULT_PRICE do servidor. */
export const DISPLAY_PRICE_FALLBACK = 14.9;

/** "14.90", "14,90" ou o antigo "R$ 14,90 por mês" → 14.9. Sem número válido: preço padrão. */
export function parseDisplayPrice(raw: string | undefined) {
  const match = raw?.match(/\d+(?:[.,]\d{1,2})?/);
  const value = match ? Number(match[0].replace(',', '.')) : NaN;
  return Number.isFinite(value) && value > 0 ? value : DISPLAY_PRICE_FALLBACK;
}

/**
 * Valor em reais (a Stripe cobra em BRL) no jeito de escrever de cada idioma:
 * "R$ 14,90" (pt), "R$14.90" (en), "14,90 R$" (es, fr, de).
 */
export function formatBRL(value: number, lang: Lang = getLanguage()) {
  const [int, cents] = value.toFixed(2).split('.');
  if (lang === 'pt-BR') return `R$ ${int},${cents}`;
  if (lang === 'en') return `R$${int}.${cents}`;
  return `${int},${cents} R$`;
}

/** Preço do Premium para a tela: { price: "R$ 14,90", period: "por mês" }, no idioma atual. */
export function premiumPriceParts(raw: string | undefined) {
  return { price: formatBRL(parseDisplayPrice(raw)), period: t.premium.perMonth };
}

/** E-mail de exemplo do .env.example: o app trata como "ainda não configurado". */
const PLACEHOLDER_EMAIL = 'contato@exemplo.com';

export function isSupportEmailConfigured(email: string) {
  const e = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e !== PLACEHOLDER_EMAIL;
}

/** Status de uma assinatura (tabela subscriptions; o servidor traduz os status da Stripe para estes). */
export type SubscriptionStatus = 'pending' | 'authorized' | 'paused' | 'cancelled';

/** Segurança: o app só abre para pagar páginas da própria Stripe (https://checkout.stripe.com/…). */
export function isStripeCheckoutUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname === 'checkout.stripe.com';
  } catch {
    return false;
  }
}

/**
 * O que a tela de acompanhamento mostra.
 * Só é "ativa" quando o Premium já entrou (a 1ª cobrança foi aprovada pelo servidor).
 */
export function subscriptionView(status: SubscriptionStatus | null | undefined, premium: boolean) {
  if (status === 'cancelled') return 'failed' as const;
  if (premium && (status === 'authorized' || status === 'paused')) return 'active' as const;
  // pendente, ou autorizada esperando a 1ª cobrança: continua "confirmando".
  return 'checking' as const;
}

/**
 * Quem ainda tem Premium pago e assina de novo só paga quando ele acabar.
 * MESMA regra do servidor (firstChargeAt em supabase/functions/_shared/payment-logic.ts): pelo menos 49 horas.
 * Devolve a data da 1ª cobrança (ISO) ou null (cobra na hora).
 */
export function deferredFirstCharge(premiumUntil: string | null | undefined, now = new Date()) {
  const until = premiumUntil ? new Date(premiumUntil).getTime() : NaN;
  if (!Number.isFinite(until) || until - now.getTime() < 49 * 60 * 60 * 1000) return null;
  return new Date(until).toISOString();
}

/** Link que abre o app de e-mail já com destinatário, assunto e texto (mailto:...?subject=...&body=...). */
export function mailtoLink(to: string, subject: string, body: string) {
  return `mailto:${to.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** "2026-10-28T12:00:00Z" → "28/10/2026" (fuso de São Paulo, UTC-3 fixo). */
export function formatDateBR(iso: string) {
  const sp = new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000);
  const dd = String(sp.getUTCDate()).padStart(2, '0');
  const mm = String(sp.getUTCMonth() + 1).padStart(2, '0');
  // Dia de São Paulo, na ordem do idioma: 31/10/2026 (pt), 10/31/2026 (en), 31.10.2026 (de).
  return t.dates.full(dd, mm, sp.getUTCFullYear());
}
