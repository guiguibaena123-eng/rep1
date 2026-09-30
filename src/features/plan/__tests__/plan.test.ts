import { firstChargeAt } from '../../../../supabase/functions/_shared/payment-logic';
import {
  deferredFirstCharge,
  DISPLAY_PRICE_FALLBACK,
  formatBRL,
  formatDateBR,
  isSupportEmailConfigured,
  mailtoLink,
  parseDisplayPrice,
  premiumPriceParts,
  subscriptionView,
} from '../logic';

describe('deferredFirstCharge (aviso "nada é cobrado agora")', () => {
  const now = new Date('2026-09-28T12:00:00Z');
  it('igual à regra do servidor', () => {
    for (const until of ['2026-10-31T12:00:00Z', '2026-09-30T13:30:00Z', '2026-09-30T12:00:00Z', '2026-09-01T00:00:00Z', null]) {
      const app = deferredFirstCharge(until, now);
      const server = firstChargeAt(until, now.getTime());
      expect(app === null ? null : Date.parse(app) / 1000).toBe(server);
    }
  });
});

describe('preço do Premium na tela', () => {
  it('lê o número do .env novo ou do rótulo antigo', () => {
    expect(parseDisplayPrice('14.90')).toBe(14.9);
    expect(parseDisplayPrice('19,9')).toBe(19.9);
    expect(parseDisplayPrice('R$ 14,90 por mês')).toBe(14.9);
    expect(parseDisplayPrice(undefined)).toBe(DISPLAY_PRICE_FALLBACK);
    expect(parseDisplayPrice('abc')).toBe(DISPLAY_PRICE_FALLBACK);
    expect(parseDisplayPrice('0')).toBe(DISPLAY_PRICE_FALLBACK);
  });
  it('escreve reais no jeito de cada idioma', () => {
    expect(formatBRL(14.9, 'pt-BR')).toBe('R$ 14,90');
    expect(formatBRL(14.9, 'en')).toBe('R$14.90');
    expect(formatBRL(9, 'de')).toBe('9,00 R$');
    expect(formatBRL(14.9, 'fr')).toBe('14,90 R$');
  });
  it('preço e período no idioma atual (português nos testes)', () => {
    expect(premiumPriceParts('14.90')).toEqual({ price: 'R$ 14,90', period: 'por mês' });
  });
});

describe('e-mail de ajuda configurado', () => {
  it('rejeita o e-mail de exemplo do .env.example e vazio', () => {
    expect(isSupportEmailConfigured('contato@exemplo.com')).toBe(false);
    expect(isSupportEmailConfigured(' Contato@Exemplo.com ')).toBe(false);
    expect(isSupportEmailConfigured('')).toBe(false);
  });
  it('aceita um e-mail de verdade', () => {
    expect(isSupportEmailConfigured('ajuda@pronto.app.br')).toBe(true);
  });
  it('rejeita o que não é e-mail', () => {
    expect(isSupportEmailConfigured('https://wa.me/5511912345678')).toBe(false);
    expect(isSupportEmailConfigured('ajuda @pronto.com')).toBe(false);
  });
});

describe('subscriptionView', () => {
  it('só mostra "ativa" quando a assinatura foi autorizada E o Premium já entrou', () => {
    expect(subscriptionView('authorized', true)).toBe('active');
    expect(subscriptionView('authorized', false)).toBe('checking');
  });
  it('pendente continua confirmando', () => {
    expect(subscriptionView('pending', false)).toBe('checking');
    expect(subscriptionView('pending', true)).toBe('checking');
  });
  it('cancelada = não concluída', () => {
    expect(subscriptionView('cancelled', false)).toBe('failed');
  });
});

describe('mailtoLink', () => {
  it('codifica assunto e texto (acentos, quebras de linha, e-mail da conta)', () => {
    expect(mailtoLink(' ajuda@pronto.com ', 'Ajuda com o Siwki', 'Oi!\n\nConta: a+b@x.com')).toBe(
      'mailto:ajuda@pronto.com?subject=Ajuda%20com%20o%20Siwki&body=Oi!%0A%0AConta%3A%20a%2Bb%40x.com',
    );
  });
});

describe('formatDateBR', () => {
  it('usa o fuso de São Paulo', () => {
    // 02:00 UTC do dia 1 ainda é dia 31 em São Paulo (UTC-3).
    expect(formatDateBR('2026-11-01T02:00:00Z')).toBe('31/10/2026');
    expect(formatDateBR('2026-11-01T12:00:00Z')).toBe('01/11/2026');
  });
});
