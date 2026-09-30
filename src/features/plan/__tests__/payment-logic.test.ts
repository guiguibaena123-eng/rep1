// Testa a lógica usada pelas Edge Functions da assinatura (supabase/functions/_shared/payment-logic.ts).
import {
  buildCheckoutSession,
  DEFAULT_PRICE,
  firstChargeAt,
  isFreshTimestamp,
  mapSubscriptionStatus,
  parsePrice,
  parseStripeSignature,
  periodEndIso,
  safeEqual,
  subscriptionIdOfInvoice,
  toCents,
} from '../../../../supabase/functions/_shared/payment-logic';

describe('parsePrice', () => {
  it('aceita ponto ou vírgula e arredonda para centavos', () => {
    expect(parsePrice('14.90')).toBe(14.9);
    expect(parsePrice('19,99')).toBe(19.99);
    expect(parsePrice('9.999')).toBe(10);
  });
  it('vazio ou absurdo vira o preço padrão', () => {
    expect(parsePrice(undefined)).toBe(DEFAULT_PRICE);
    expect(parsePrice('abc')).toBe(DEFAULT_PRICE);
    expect(parsePrice('0')).toBe(DEFAULT_PRICE);
    expect(parsePrice('5000')).toBe(DEFAULT_PRICE);
  });
  it('centavos sem erro de arredondamento', () => {
    expect(toCents(14.9)).toBe(1490);
    expect(toCents(19.99)).toBe(1999);
  });
});

describe('buildCheckoutSession', () => {
  const s = buildCheckoutSession({
    subscriptionId: '00000000-0000-4000-a000-000000000001',
    userId: '00000000-0000-4000-a000-000000000002',
    email: 'ana@exemplo.com',
    price: 14.9,
    returnUrl: 'https://x.supabase.co/functions/v1/stripe-webhook',
  });

  it('assinatura mensal em reais, com o preço do servidor', () => {
    expect(s.mode).toBe('subscription');
    expect(s['line_items[0][price_data][currency]']).toBe('brl');
    expect(s['line_items[0][price_data][unit_amount]']).toBe('1490');
    expect(s['line_items[0][price_data][recurring][interval]']).toBe('month');
    expect(s.locale).toBe('pt-BR');
  });
  it('ligada ao nosso id (página e assinatura)', () => {
    expect(s.client_reference_id).toBe('00000000-0000-4000-a000-000000000001');
    expect(s['subscription_data[metadata][subscription_id]']).toBe('00000000-0000-4000-a000-000000000001');
    expect(s['subscription_data[metadata][user_id]']).toBe('00000000-0000-4000-a000-000000000002');
    expect(s.customer_email).toBe('ana@exemplo.com');
  });
  it('volta para a nossa página de retorno', () => {
    expect(s.success_url).toBe('https://x.supabase.co/functions/v1/stripe-webhook?retorno=ok');
    expect(s.cancel_url).toBe('https://x.supabase.co/functions/v1/stripe-webhook?retorno=cancelado');
  });
});

describe('firstChargeAt (reativar sem pagar de novo o que já foi pago)', () => {
  const now = Date.parse('2026-09-28T12:00:00Z');
  it('Premium pago por mais de 49 horas → 1ª cobrança quando ele acaba', () => {
    expect(firstChargeAt('2026-10-31T12:00:00Z', now)).toBe(Date.parse('2026-10-31T12:00:00Z') / 1000);
    expect(firstChargeAt('2026-09-30T13:30:00Z', now)).toBe(Date.parse('2026-09-30T13:30:00Z') / 1000);
  });
  it('sem Premium, vencido ou acabando em menos de 49 horas → cobra agora', () => {
    expect(firstChargeAt(null, now)).toBeNull();
    expect(firstChargeAt('2026-09-01T00:00:00Z', now)).toBeNull();
    expect(firstChargeAt('2026-09-30T12:00:00Z', now)).toBeNull();
    expect(firstChargeAt('lixo', now)).toBeNull();
  });
  it('vai para a Stripe como trial_end (só quando adiada)', () => {
    const base = { subscriptionId: 'a', userId: 'b', email: 'c@d.com', price: 14.9, returnUrl: 'https://x' };
    expect(buildCheckoutSession({ ...base, firstChargeAt: 1790000000 })['subscription_data[trial_end]']).toBe('1790000000');
    expect(buildCheckoutSession(base)['subscription_data[trial_end]']).toBeUndefined();
  });
});

describe('mapSubscriptionStatus', () => {
  it('status da Stripe → nosso status', () => {
    expect(mapSubscriptionStatus('incomplete')).toBe('pending');
    expect(mapSubscriptionStatus('active')).toBe('authorized');
    expect(mapSubscriptionStatus('past_due')).toBe('authorized');
    expect(mapSubscriptionStatus('unpaid')).toBe('paused');
    expect(mapSubscriptionStatus('canceled')).toBe('cancelled');
    expect(mapSubscriptionStatus('incomplete_expired')).toBe('cancelled');
    expect(mapSubscriptionStatus('qualquer')).toBeNull();
  });
});

describe('subscriptionIdOfInvoice', () => {
  it('lê a assinatura nas versões nova e antiga da API', () => {
    expect(subscriptionIdOfInvoice({ parent: { subscription_details: { subscription: 'sub_123abc' } } })).toBe('sub_123abc');
    expect(subscriptionIdOfInvoice({ subscription: 'sub_456' })).toBe('sub_456');
    expect(subscriptionIdOfInvoice({ subscription: { id: 'sub_789' } })).toBe('sub_789');
  });
  it('fatura avulsa (ou id estranho) → null', () => {
    expect(subscriptionIdOfInvoice({})).toBeNull();
    expect(subscriptionIdOfInvoice({ parent: null })).toBeNull();
    expect(subscriptionIdOfInvoice({ subscription: 'sub_a b;drop' })).toBeNull();
    expect(subscriptionIdOfInvoice({ subscription: 'cus_123' })).toBeNull();
  });
});

describe('periodEndIso', () => {
  it('lê o fim do período no item (API nova) ou na assinatura (API antiga)', () => {
    expect(periodEndIso({ items: { data: [{ current_period_end: 1790000000 }] } })).toBe(new Date(1790000000 * 1000).toISOString());
    expect(periodEndIso({ current_period_end: 1790000000 })).toBe(new Date(1790000000 * 1000).toISOString());
    expect(periodEndIso({})).toBeNull();
  });
});

describe('assinatura do aviso', () => {
  it('lê t e todos os v1 do cabeçalho Stripe-Signature', () => {
    expect(parseStripeSignature('t=1492774577,v1=abc,v0=zzz,v1=def')).toEqual({ t: '1492774577', v1: ['abc', 'def'] });
    expect(parseStripeSignature(null)).toEqual({ v1: [] });
  });

  it('recusa aviso velho (mais de 5 minutos) ou sem data', () => {
    const now = 1_700_000_000_000;
    expect(isFreshTimestamp('1700000000', now)).toBe(true);
    expect(isFreshTimestamp('1699999800', now)).toBe(true);
    expect(isFreshTimestamp('1699999000', now)).toBe(false);
    expect(isFreshTimestamp(undefined, now)).toBe(false);
    expect(isFreshTimestamp('abc', now)).toBe(false);
  });

  it('compara assinaturas', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});
