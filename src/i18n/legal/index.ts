/**
 * Termos de Uso e Política de Privacidade, um arquivo por idioma.
 * TEXTO PROVISÓRIO — revisar com advogado antes do lançamento (inclusive as traduções).
 * O português é a versão de referência; as outras seguem as mesmas seções, na mesma ordem.
 */
import { getLanguage, type Lang } from '..';

import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ptBR } from './pt-BR';
import type { LegalDocs } from './types';

export type { LegalDocs, LegalSection } from './types';

export const LEGAL: Record<Lang, LegalDocs> = { 'pt-BR': ptBR, en, es, fr, de };

/** Seções do documento no idioma atual do app. */
export function legalSections(doc: 'terms' | 'privacy', lang: Lang = getLanguage()) {
  return LEGAL[lang][doc];
}
