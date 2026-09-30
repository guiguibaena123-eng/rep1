import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

import type { VerifiedKind } from './verified';

/** Contorno do selo (formato "badge-check" do Lucide), o mesmo para os três tipos. */
const SEAL =
  'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z';
/** Diamante (formato "gem" do Lucide), desenhado em 24x24 e reduzido para caber no centro do selo. */
const GEM = 'M6 3h12l4 6-10 13L2 9Z';
const GEM_FACETS = 'M11 3 8 9l4 13 4-13-3-6M2 9h20';

/**
 * Selo de verificado ao lado do nome.
 * - azul / dourado: selo preenchido com o ✓ branco por cima;
 * - diamante (conta oficial): o mesmo selo em azul-gelo com brilho (degradê) e um diamante no lugar do ✓.
 */
export function VerifiedBadge({ kind, size = 20 }: { kind: VerifiedKind; size?: number }) {
  const { colors } = useTheme();
  const label = t.verified[kind];

  if (kind === 'diamond') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessible accessibilityRole="image" accessibilityLabel={label}>
        <Defs>
          <LinearGradient id="siwki-diamond" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={colors.verifiedDiamondLight} />
            <Stop offset="1" stopColor={colors.verifiedDiamond} />
          </LinearGradient>
        </Defs>
        <Path d={SEAL} fill="url(#siwki-diamond)" stroke={colors.verifiedDiamond} strokeWidth={1.5} strokeLinejoin="round" />
        <G transform="translate(6.48 6.25) scale(0.46)">
          <Path d={GEM} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" />
          <Path
            d={GEM_FACETS}
            fill="none"
            stroke={colors.verifiedDiamond}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    );
  }

  const color = kind === 'gold' ? colors.verifiedGold : colors.verifiedBlue;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible accessibilityRole="image" accessibilityLabel={label}>
      <Path d={SEAL} fill={color} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <Path
        d="m8.5 12 2.5 2.5 4.5-5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
