import { useEffect } from 'react';

import { useToast } from '@/components';
import { usePreferences } from '@/features/preferences/store';
import { isPremium, type Profile } from '@/features/profile/types';
import { t } from '@/i18n';

/**
 * "Você recebe um aviso no app" (T17): quando o perfil recarrega (ao abrir o app ou voltar
 * para ele) e o plano passou de grátis para Premium, mostra um aviso uma única vez.
 */
export function usePremiumActivatedNotice(userId: string | undefined, profile: Profile | undefined) {
  const toast = useToast();
  const hydrated = usePreferences((s) => s.hydrated);
  const seen = usePreferences((s) => (userId ? s.premiumSeen[userId] : undefined));
  const setSeen = usePreferences((s) => s.setPremiumSeen);
  const premium = profile ? isPremium(profile) : undefined;

  useEffect(() => {
    if (!hydrated || !userId || premium === undefined || seen === premium) return;
    // Primeira vez neste aparelho (seen indefinido): só guarda, sem aviso.
    if (seen === false && premium) toast.show(t.premium.activated);
    setSeen(userId, premium);
  }, [hydrated, userId, premium, seen, setSeen, toast]);
}
