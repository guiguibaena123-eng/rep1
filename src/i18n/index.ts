import { getLocales } from 'expo-localization';

import { APP_NAME } from './app';
import { de } from './locales/de';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { ptBR } from './locales/pt-BR';

export { APP_NAME };

/** Troca literais por tipos amplos: cada idioma tem os mesmos campos, com textos diferentes. */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends (...args: infer A) => infer R
        ? (...args: A) => Widen<R>
        : T extends readonly (infer U)[]
          ? readonly Widen<U>[]
          : T extends object
            ? { readonly [K in keyof T]: Widen<T[K]> }
            : T;

/** Formato de todos os dicionários: o português é a referência (falta um texto = erro de tipo). */
export type Dict = Widen<typeof ptBR>;

export const LANGUAGES = [
  { code: 'pt-BR', flag: '🇧🇷', name: 'Português (Brasil)' },
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
] as const;

export type Lang = (typeof LANGUAGES)[number]['code'];

const DICTS: Record<Lang, Dict> = { 'pt-BR': ptBR, en, es, fr, de };

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && value in DICTS;
}

/** Idioma do celular, se o app tiver; senão português (o público principal é brasileiro). */
export function deviceLanguage(): Lang {
  try {
    for (const locale of getLocales()) {
      const code = locale.languageCode?.toLowerCase();
      if (code === 'pt') return 'pt-BR';
      if (isLang(code)) return code;
    }
  } catch {
    // Sem o módulo nativo (ex.: testes): segue no português.
  }
  return 'pt-BR';
}

let currentLang: Lang = deviceLanguage();
let current: Dict = DICTS[currentLang];

export function getLanguage(): Lang {
  return currentLang;
}

/** Troca o dicionário. Quem chama remonta as telas (a raiz usa o idioma como key). */
export function setLanguage(lang: Lang) {
  currentLang = lang;
  current = DICTS[lang];
}

/**
 * `t` sempre lê o dicionário ATUAL, mesmo guardado num atalho no topo de um arquivo
 * (ex.: `const h = t.home`): objetos viram "ponteiros" para o caminho, e só textos,
 * listas e funções saem de verdade na hora do uso.
 */
const cache = new Map<string, object>();

function resolve(path: readonly PropertyKey[]): unknown {
  let value: unknown = current;
  for (const key of path) value = (value as Record<PropertyKey, unknown> | undefined)?.[key];
  return value;
}

const isPlainObject = (v: unknown): v is object => v !== null && typeof v === 'object' && !Array.isArray(v);

function pointer(path: readonly PropertyKey[]): object {
  const id = path.map(String).join('.');
  const hit = cache.get(id);
  if (hit) return hit;
  const proxy = new Proxy(
    {},
    {
      get(_, key) {
        const value = resolve([...path, key]);
        return isPlainObject(value) ? pointer([...path, key]) : value;
      },
      has: (_, key) => key in (resolve(path) as object),
      ownKeys: () => Reflect.ownKeys(resolve(path) as object),
      getOwnPropertyDescriptor(_, key) {
        const target = resolve(path) as object;
        if (!Object.prototype.hasOwnProperty.call(target, key)) return undefined;
        const value = resolve([...path, key]);
        return { enumerable: true, configurable: true, writable: false, value: isPlainObject(value) ? pointer([...path, key]) : value };
      },
    },
  );
  cache.set(id, proxy);
  return proxy;
}

export const t = pointer([]) as Dict;

/** Nome do idioma na lista (sempre no próprio idioma, como em qualquer seletor). */
export function languageName(lang: Lang) {
  return LANGUAGES.find((l) => l.code === lang)!.name;
}
