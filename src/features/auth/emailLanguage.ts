import type { Session } from '@supabase/supabase-js';
import { useEffect } from 'react';

import { getLanguage, type Lang } from '@/i18n';
import { supabase } from '@/lib/supabase';

/**
 * Os e-mails da conta (confirmar e-mail, criar senha nova) são escritos pelo Supabase,
 * que escolhe o idioma pelo campo "language" dos dados do usuário (modelos em supabase/templates).
 */
export function emailLanguageData(lang: Lang = getLanguage()) {
  return { language: lang };
}

/** true se os dados da conta ainda não têm o idioma atual do app. */
export function needsEmailLanguageUpdate(session: Session | null, lang: Lang) {
  return !!session && session.user.user_metadata?.language !== lang;
}

/**
 * Guarda o idioma do app na conta (ao entrar e ao trocar de idioma), para os próximos e-mails
 * virem nesse idioma. Contas antigas e de Google ainda não têm o campo: recebem na primeira vez.
 * `language` só serve para rodar de novo quando a pessoa troca o idioma.
 */
export function useEmailLanguageSync(session: Session | null, language: string) {
  useEffect(() => {
    const lang = getLanguage();
    if (!needsEmailLanguageUpdate(session, lang)) return;
    // Sem internet agora? Tenta de novo na próxima abertura.
    supabase.auth.updateUser({ data: emailLanguageData(lang) }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só importa o usuário e o idioma
  }, [session?.user.id, session?.user.user_metadata?.language, language]);
}
