import * as Linking from 'expo-linking';

import { useToast } from '@/components';
import { useAuth } from '@/features/auth/AuthProvider';
import { t } from '@/i18n';
import { env } from '@/lib/env';
import { track } from '@/lib/events';

import { isSupportEmailConfigured, mailtoLink } from './logic';

/**
 * Abre o app de e-mail do celular, para o e-mail de ajuda (EXPO_PUBLIC_SUPPORT_EMAIL), com assunto e texto prontos.
 * "missing": o .env ainda está com o e-mail de exemplo. "error": o celular não tem app de e-mail configurado.
 */
export async function openSupportEmail(subject: string, body: string): Promise<'ok' | 'missing' | 'error'> {
  if (!isSupportEmailConfigured(env.supportEmail)) return 'missing';
  try {
    await Linking.openURL(mailtoLink(env.supportEmail, subject, body));
    return 'ok';
  } catch {
    return 'error';
  }
}

/** "Ajuda e contato" / "Precisa de ajuda?": abre o e-mail já com o e-mail da conta; se não der, mostra o endereço. */
export function useContactSupport() {
  const toast = useToast();
  const { session } = useAuth();
  const email = session?.user.email ?? '';

  return async (topic: 'ajuda' | 'assinatura') => {
    const texts = topic === 'assinatura' ? t.payment : t.profile;
    const result = await openSupportEmail(texts.helpSubject, texts.helpBody(email));
    if (result === 'missing') toast.show(t.profile.contactMissing, 'error');
    else if (result === 'error') toast.show(t.profile.openError(env.supportEmail.trim()), 'error');
    else track('support_opened', { from: topic });
  };
}
