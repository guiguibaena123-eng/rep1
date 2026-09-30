/**
 * Selo de verificado ao lado do nome (Perfil e Meu perfil).
 * - dourado: a conta do criador do Siwki (pelo ID, que nunca muda);
 * - azul: quem é Premium.
 * O selo só aparece para a própria pessoa (o app não mostra perfis de outros usuários).
 */
export const OWNER_USER_ID = '07e4af07-702b-4405-a4f3-506797c3c14c';

export type VerifiedKind = 'gold' | 'blue';

export function verifiedKind(userId: string | null | undefined, premium: boolean): VerifiedKind | null {
  if (userId && userId === OWNER_USER_ID) return 'gold';
  return premium ? 'blue' : null;
}
