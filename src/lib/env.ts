import { getLanguage, t } from '@/i18n';

/**
 * Variáveis públicas do app (arquivo .env, prefixo EXPO_PUBLIC_).
 * Precisam ser lidas por nome fixo (process.env.EXPO_PUBLIC_X) para o Expo embutir o valor.
 */
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  /**
   * Só para mostrar na tela, em reais ("14.90"). O valor cobrado de verdade é o segredo PREMIUM_PRICE, no servidor.
   * O antigo EXPO_PUBLIC_PREMIUM_PRICE_LABEL ("R$ 14,90 por mês") ainda funciona: o app lê só o número.
   */
  premiumPrice: process.env.EXPO_PUBLIC_PREMIUM_PRICE ?? process.env.EXPO_PUBLIC_PREMIUM_PRICE_LABEL ?? '14.90',
  /** E-mail de ajuda e contato (Perfil, assinatura). Também é o canal dos Termos (reembolso) e da Privacidade (LGPD). */
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '',
  cvvUrl: process.env.EXPO_PUBLIC_CVV_URL ?? 'https://cvv.org.br',
};

/** Linha de apoio emocional: CVV em português; nos outros idiomas, a linha do país do idioma. */
export function crisisUrl() {
  return getLanguage() === 'pt-BR' ? env.cvvUrl : t.crisis.url;
}

/** true se o .env foi preenchido com um projeto Supabase de verdade. */
export const isSupabaseConfigured =
  /^https:\/\/.+\.supabase\.co\/?$/.test(env.supabaseUrl) &&
  env.supabaseKey.length > 20 &&
  !env.supabaseUrl.includes('SEU-PROJETO');
