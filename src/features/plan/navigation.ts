import { router } from 'expo-router';

/** De onde a pessoa abriu o Premium (vai para as métricas, sem dado pessoal). */
export type PremiumSource = 'inicio' | 'perfil' | 'treinar' | 'linkedin' | 'relatorio' | 'dicas' | 'dica';

/** Abre a T16 Premium. */
export function openPremium(from: PremiumSource) {
  router.push({ pathname: '/premium', params: { from } });
}
