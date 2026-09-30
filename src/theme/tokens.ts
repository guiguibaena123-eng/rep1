/**
 * Tokens de design do Siwki.
 * Fonte da verdade: design/design-tokens.json. Se mudar lá, mude aqui.
 */

/*
 * 2026-09-30: a cor principal passou do índigo (#5B5BD6) para o AZUL DA MARCA
 * (design/identidade: azul sólido #0A5CF0, degradê #5AAEFF → #0553E6), a pedido do usuário.
 * Os neutros perderam o tom lilás e ficaram levemente azulados (mesma claridade).
 * Contraste AA conferido: branco sobre primary 5,5:1; primaryInk sobre branco 7:1.
 */
export const lightColors = {
  primary: '#0A5CF0',
  primaryPressed: '#0947D0',
  primarySoft: '#E8F0FE',
  primaryInk: '#0947D0',
  onPrimary: '#FFFFFF',
  success: '#2FBF8F',
  successSoft: '#E3F7F0',
  successInk: '#1A7A5A',
  warning: '#FFB84D',
  warningSoft: '#FFF3DE',
  warningInk: '#8A5300',
  onWarning: '#4A2F00',
  error: '#E5484D',
  errorSoft: '#FDECEC',
  errorInk: '#C4373C',
  background: '#F6F8FC',
  surface: '#FFFFFF',
  border: '#E5EAF2',
  text: '#1B1B1F',
  textSecondary: '#676E7B',
  textDisabled: '#A2A8B3',
  /** Texto secundário sobre primarySoft (cards destaque): textSecondary ali fica 4,47:1; este dá 5,4:1. */
  textOnSoft: '#56617A',
  scrim: 'rgba(27,27,31,0.4)',
  // Valores extras que aparecem nas telas (design/telas/*.dc.html), mas não no JSON:
  /** Fundo do seletor de abas da T3 e trilho de pontos inativos. */
  segmentTrack: '#EBEFF6',
  dotInactive: '#D3DBE8',
  /** Linhas secundárias do skeleton. */
  skeletonSoft: '#EDF1F7',
  /** Anel de nota na faixa baixa ("azul suave"). */
  scoreLow: '#A3C6FF',
  /** Texto do toast (um tom abaixo do *Ink para contraste AA sobre o fundo suave). */
  toastSuccessText: '#14573F',
  toastErrorText: '#9E2A2E',
  /** Ícone da sequência de dias (âmbar mais escuro sobre warningSoft). */
  streakIcon: '#B86E00',
  /** Selo de verificado ao lado do nome: azul = Premium; dourado = criador do app; diamante = conta oficial. */
  verifiedBlue: '#0A5CF0',
  verifiedGold: '#C28A0E',
  /** Diamante: a conta oficial do Siwki. */
  verifiedDiamond: '#1E9BE8',
  verifiedDiamondLight: '#7FE0FF',
};

export type ColorTokens = typeof lightColors;

export const darkColors: ColorTokens = {
  // Azul da marca clareado para o fundo escuro. Texto escuro sobre ele: 5,9:1.
  primary: '#4D8DFF',
  primaryPressed: '#3A7BEF',
  primarySoft: '#14264A',
  primaryInk: '#8DB8FF',
  // Branco não passa no contraste AA sobre o azul clareado.
  onPrimary: '#0F1117',
  success: '#2FBF8F',
  successSoft: '#15302A',
  successInk: '#5FD8AF',
  warning: '#FFB84D',
  warningSoft: '#33291A',
  warningInk: '#FFC978',
  onWarning: '#4A2F00',
  error: '#E5484D',
  errorSoft: '#3A1C1E',
  errorInk: '#FF8A8E',
  background: '#0F1117',
  surface: '#181C24',
  border: '#272C37',
  text: '#F2F4F7',
  textSecondary: '#9CA3B0',
  textDisabled: '#666D7A',
  textOnSoft: '#A9B6CC',
  scrim: 'rgba(0,0,0,0.6)',
  segmentTrack: '#1F2430',
  dotInactive: '#272C37',
  skeletonSoft: '#1F2430',
  scoreLow: '#8DB8FF',
  toastSuccessText: '#5FD8AF',
  toastErrorText: '#FF8A8E',
  streakIcon: '#FFC978',
  verifiedBlue: '#4D8DFF',
  verifiedGold: '#F2B530',
  verifiedDiamond: '#45B4F5',
  verifiedDiamondLight: '#B8F0FF',
};

/**
 * Nomes das fontes carregadas em src/app/_layout.tsx.
 * No React Native, com fonte personalizada, o peso vem do arquivo da fonte,
 * por isso cada peso tem um nome próprio (não use fontWeight junto).
 */
export const fonts = {
  heading700: 'PlusJakartaSans_700Bold',
  heading800: 'PlusJakartaSans_800ExtraBold',
  body400: 'Inter_400Regular',
  body500: 'Inter_500Medium',
  body600: 'Inter_600SemiBold',
  /** Títulos das abas: Quicksand (arredondada, combina com o traço do logo). */
  title700: 'Quicksand_700Bold',
} as const;

export type FontName = (typeof fonts)[keyof typeof fonts];

type TypeStyle = { fontSize: number; lineHeight: number; fontFamily: FontName; letterSpacing?: number };

export const typeScale = {
  // Títulos das abas em Quicksand (arredondada).
  brandDisplay: { fontSize: 30, lineHeight: 38, fontFamily: fonts.title700 },
  brandTitle: { fontSize: 26, lineHeight: 34, fontFamily: fonts.title700 },
  display: { fontSize: 28, lineHeight: 34, fontFamily: fonts.heading800, letterSpacing: -0.3 },
  screenTitle: { fontSize: 24, lineHeight: 30, fontFamily: fonts.heading700 },
  sectionTitle: { fontSize: 18, lineHeight: 24, fontFamily: fonts.heading700 },
  /** Título de card destaque e de bottom sheet (20/26). */
  cardTitle: { fontSize: 20, lineHeight: 26, fontFamily: fonts.heading700 },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fonts.body400 },
  bodySmall: { fontSize: 14, lineHeight: 20, fontFamily: fonts.body400 },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.body500 },
  button: { fontSize: 16, lineHeight: 24, fontFamily: fonts.body600 },
} satisfies Record<string, TypeStyle>;

export type TypeVariant = keyof typeof typeScale;

/** Grade de 4px. Use space[n] em vez de números soltos. */
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 14: 56 } as const;

export const screenPadding = 20;

export const radius = { button: 14, input: 14, card: 20, chip: 999, sheetTop: 28 } as const;

export const size = {
  buttonHeight: 52,
  inputHeight: 52,
  minTouch: 48,
  progressHeight: 8,
  navBarHeight: 84,
} as const;

/** Sombra "elevated": 0 4px 16px rgba(27,27,31,0.06). Use só em cards elevados e bottom sheets. */
export const shadowElevated = {
  shadowColor: '#1B1B1F',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  elevation: 3,
} as const;

export const motion = { fast: 150, base: 200, slow: 250, pressScale: 0.97 } as const;

export const iconStroke = 1.75;
