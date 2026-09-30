import { OFFICIAL_USER_ID, OWNER_USER_ID, verifiedKind } from '../verified';

describe('verifiedKind (selo ao lado do nome)', () => {
  it('criador do app: dourado, com ou sem Premium', () => {
    expect(verifiedKind(OWNER_USER_ID, true)).toBe('gold');
    expect(verifiedKind(OWNER_USER_ID, false)).toBe('gold');
  });

  it('conta oficial do Siwki: diamante, com ou sem Premium', () => {
    expect(verifiedKind(OFFICIAL_USER_ID, false)).toBe('diamond');
    expect(verifiedKind(OFFICIAL_USER_ID, true)).toBe('diamond');
  });

  it('Premium: azul; grátis: sem selo', () => {
    expect(verifiedKind('outra-pessoa', true)).toBe('blue');
    expect(verifiedKind('outra-pessoa', false)).toBeNull();
    expect(verifiedKind(undefined, false)).toBeNull();
  });
});
