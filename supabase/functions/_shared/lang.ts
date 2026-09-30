// Idioma do app: chega no cabeçalho x-app-lang e decide em que língua a IA escreve.
// Sem imports locais e sem nada do Deno: os testes do app (Jest) importam este arquivo direto.

export const APP_LANGS = ['pt-BR', 'en', 'es', 'fr', 'de'] as const;
export type AppLang = (typeof APP_LANGS)[number];

export const LANG_HEADER = 'x-app-lang';

/** Valor desconhecido ou ausente (app antigo) → português, o idioma de sempre. */
export function parseLang(value: unknown): AppLang {
  return typeof value === 'string' && (APP_LANGS as readonly string[]).includes(value) ? (value as AppLang) : 'pt-BR';
}

export function langFromRequest(req: Request): AppLang {
  return parseLang(req.headers.get(LANG_HEADER));
}

/**
 * Como cada idioma entra nos prompts (que continuam escritos em português).
 * market: de onde é o mercado de trabalho que a IA deve ter em mente.
 * fillers: exemplos de vícios de linguagem, para o feedback da simulação.
 */
export type OutputLanguage = { code: AppLang; name: string; market: string; fillers: readonly string[] };

export const OUTPUT_LANGUAGE: Record<AppLang, OutputLanguage> = {
  'pt-BR': { code: 'pt-BR', name: 'português do Brasil', market: 'brasileiro', fillers: ['tipo', 'né'] },
  en: {
    code: 'en',
    name: 'inglês',
    market: 'de países de língua inglesa (como Estados Unidos e Reino Unido)',
    fillers: ['like', 'um'],
  },
  es: { code: 'es', name: 'espanhol', market: 'da Espanha e da América Latina', fillers: ['o sea', 'este'] },
  fr: { code: 'fr', name: 'francês', market: 'da França e de outros países de língua francesa', fillers: ['euh', 'du coup'] },
  de: { code: 'de', name: 'alemão', market: 'da Alemanha, da Áustria e da Suíça', fillers: ['ähm', 'halt'] },
};
