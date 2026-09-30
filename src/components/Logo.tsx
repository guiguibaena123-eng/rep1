import Svg, { Circle, Defs, G, LinearGradient, Mask, Path, Rect, Stop } from 'react-native-svg';

import { APP_NAME } from '@/i18n';
import { lightColors } from '@/theme/tokens';

/** Símbolo do Siwki: balão de conversa com check (design/telas/T01Abertura e T03Conta). */
export function LogoMark({ size, tone }: { size: number; tone: 'primary' | 'onPrimary' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityElementsHidden importantForAccessibility="no">
      {tone === 'onPrimary' ? (
        <Rect width={48} height={48} rx={14} fill="#FFFFFF" fillOpacity={0.14} />
      ) : (
        <Rect width={48} height={48} rx={14} fill={lightColors.primary} />
      )}
      <Path d="M14 22a10 10 0 0 1 10-10a10 10 0 0 1 10 10a10 10 0 0 1-10 10h-6l-4 4z" fill="#FFFFFF" />
      <Path d="m19 22 3.5 3.5L29 19" stroke={lightColors.primary}strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/*
 * Logo horizontal (maleta + nome), igual a design/identidade/logo/horizontal/logo-transparente.svg.
 * Os desenhos ficam exportados para a abertura (BrandSplash) animar os mesmos traços.
 */

export const LOGO_VIEWBOX = '180 150 1040 320';
/** Proporção do logo horizontal (largura / altura). */
export const LOGO_RATIO = 1040 / 320;

export const BRAND_BLUE_TOP = '#5AAEFF';
export const BRAND_BLUE_BOTTOM = '#0553E6';

/** Maleta: desenhada em outra escala (ver BAG_TRANSFORM). len = comprimento aproximado do traço. */
export const BAG = {
  d: 'M270 480 H290 Q200 480 200 570 V740 Q200 830 290 830 H730 Q820 830 820 740 V570 Q820 480 730 480 H400 V360 A110 110 0 0 1 620 360 V395',
  len: 2300,
};
export const BAG_TRANSFORM = 'translate(357,254) scale(0.42) translate(-510,-540)';
export const WORD_TRANSFORM = 'translate(557,110) scale(2)';

/** Letras do nome, na ordem em que são escritas. */
export const LETTERS = [
  { d: 'M58 62 Q50 52 36 52 Q12 52 12 72 Q12 90 36 95 Q60 100 60 118 Q60 138 34 138 Q16 138 8 126', len: 300 }, // s
  { d: 'M84 52 V138', len: 90 }, // i
  { d: 'M110 52 V108 Q110 138 134 138 Q154 138 154 108 V52 M154 108 Q154 138 176 138 Q198 138 198 108 V52', len: 380 }, // w
  { d: 'M226 10 V138 M278 52 L228 102 M246 84 L280 138', len: 280 }, // k
  { d: 'M306 52 V138', len: 90 }, // i
] as const;

/** Pingo do primeiro "i" e o pingo com ✓ do último (o ✓ é recortado pela máscara). */
export const DOT = { cx: 84, cy: 18, r: 7 };
export const CHECK_DOT = { cx: 306, cy: 18, r: 13 };
export const CHECK_D = 'M299 18.5 L303.5 23.5 L313.5 12';

export type LogoTone = 'brand' | 'white';

/*
 * Maleta sozinha e mais larga: o ícone do canto das abas (pedido do usuário).
 * O corpo cresce `w` para cada lado; a alça e os cantos arredondados continuam iguais.
 * A abertura usa bagPath(0 → BAG_WIDEN) para esticar a maleta durante o voo.
 */
export const BAG_WIDEN = 80;
export function bagPath(w: number) {
  'worklet';
  const l = 200 - w; // lado esquerdo
  const r = 820 + w; // lado direito
  // Com w = 0 é exatamente o traço original (BAG.d).
  return `M270 480 H${l + 90} Q${l} 480 ${l} 570 V740 Q${l} 830 ${l + 90} 830 H${r - 90} Q${r} 830 ${r} 740 V570 Q${r} 480 ${r - 90} 480 H400 V360 A110 110 0 0 1 620 360 V395`;
}
/** Comprimento aproximado do traço da maleta esticada (para o desenho animado). */
export const BAG_WIDE_LEN = 2700;
/** Limites da maleta esticada (com a metade da espessura do traço, 24). */
export const BAG_ICON_VIEWBOX = `${200 - BAG_WIDEN - 24} 226 ${620 + 2 * BAG_WIDEN + 48} 628`;
export const BAG_ICON_RATIO = (620 + 2 * BAG_WIDEN + 48) / 628;
/** Altura do ícone da maleta no canto das abas. A abertura voa até este tamanho. */
export const TAB_ICON_HEIGHT = 28;

/** Ícone da maleta esticada (canto superior esquerdo das abas). */
export function BagLogo({ height = TAB_ICON_HEIGHT, tone = 'brand' }: { height?: number; tone?: LogoTone }) {
  return (
    <Svg
      width={height * BAG_ICON_RATIO}
      height={height}
      viewBox={BAG_ICON_VIEWBOX}
      accessible
      accessibilityRole="image"
      accessibilityLabel={APP_NAME}
    >
      <Defs>
        <LinearGradient id="siwki-bag" gradientUnits="userSpaceOnUse" x1="0" y1="226" x2="0" y2="854">
          <Stop offset="0" stopColor={BRAND_BLUE_TOP} />
          <Stop offset="1" stopColor={BRAND_BLUE_BOTTOM} />
        </LinearGradient>
      </Defs>
      <Path
        d={bagPath(BAG_WIDEN)}
        fill="none"
        stroke={tone === 'white' ? '#FFFFFF' : 'url(#siwki-bag)'}
        strokeWidth={48}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Logo estático. tone 'brand' = degradê azul (fundo claro); 'white' = branco (fundo escuro ou índigo).
 */
export function Logo({ height = 30, tone = 'brand' }: { height?: number; tone?: LogoTone }) {
  const bag = tone === 'white' ? '#FFFFFF' : 'url(#siwki-gi)';
  const word = tone === 'white' ? '#FFFFFF' : 'url(#siwki-gw)';
  return (
    <Svg
      width={height * LOGO_RATIO}
      height={height}
      viewBox={LOGO_VIEWBOX}
      accessible
      accessibilityRole="image"
      accessibilityLabel={APP_NAME}
    >
      <Defs>
        <LinearGradient id="siwki-gi" gradientUnits="userSpaceOnUse" x1="0" y1="226" x2="0" y2="854">
          <Stop offset="0" stopColor={BRAND_BLUE_TOP} />
          <Stop offset="1" stopColor={BRAND_BLUE_BOTTOM} />
        </LinearGradient>
        <LinearGradient id="siwki-gw" gradientUnits="userSpaceOnUse" x1="0" y1="8" x2="0" y2="146">
          <Stop offset="0" stopColor={BRAND_BLUE_TOP} />
          <Stop offset="1" stopColor={BRAND_BLUE_BOTTOM} />
        </LinearGradient>
        <CheckMask id="siwki-ck" />
      </Defs>
      <G transform="translate(0,42)">
        <G transform={BAG_TRANSFORM}>
          <Path d={BAG.d} fill="none" stroke={bag} strokeWidth={48} strokeLinecap="round" strokeLinejoin="round" />
        </G>
        <G transform={WORD_TRANSFORM}>
          <G fill="none" stroke={word} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
            {LETTERS.map((l) => (
              <Path key={l.d} d={l.d} />
            ))}
          </G>
          <Circle {...DOT} fill={word} />
          <Circle {...CHECK_DOT} fill={word} mask="url(#siwki-ck)" />
        </G>
      </G>
    </Svg>
  );
}

/** Máscara que recorta o ✓ do pingo do último "i" (o fundo aparece pelo ✓). */
export function CheckMask({ id }: { id: string }) {
  return (
    <Mask id={id} maskUnits="userSpaceOnUse" x="276" y="-10" width="60" height="60">
      <Rect x="276" y="-10" width="60" height="60" fill="#fff" />
      <Path d={CHECK_D} fill="none" stroke="#000" strokeWidth={5.2} strokeLinecap="round" strokeLinejoin="round" />
    </Mask>
  );
}
