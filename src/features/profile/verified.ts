/**
 * Selo de verificado ao lado do nome (Perfil e Meu perfil).
 * - diamante: a conta oficial do Siwki (pelo ID, que nunca muda);
 * - dourado: a conta do criador do Siwki (também pelo ID);
 * - azul: quem é Premium.
 * Os outros usuários veem o selo vindo do banco (função verified_kind, mesma regra).
 */
export const OWNER_USER_ID = '07e4af07-702b-4405-a4f3-506797c3c14c';
export const OFFICIAL_USER_ID = '9e47b10c-b8bd-404f-a16f-4599af5dedb5';

export type VerifiedKind = 'diamond' | 'gold' | 'blue';

export function verifiedKind(userId: string | null | undefined, premium: boolean): VerifiedKind | null {
  if (userId && userId === OFFICIAL_USER_ID) return 'diamond';
  if (userId && userId === OWNER_USER_ID) return 'gold';
  return premium ? 'blue' : null;
}
