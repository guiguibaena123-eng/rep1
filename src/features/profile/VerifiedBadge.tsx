import Svg, { Path } from 'react-native-svg';

import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

import type { VerifiedKind } from './verified';

/** Selo preenchido (formato "badge-check" do Lucide) com o ✓ branco por cima. */
export function VerifiedBadge({ kind, size = 20 }: { kind: VerifiedKind; size?: number }) {
  const { colors } = useTheme();
  const color = kind === 'gold' ? colors.verifiedGold : colors.verifiedBlue;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessible
      accessibilityRole="image"
      accessibilityLabel={kind === 'gold' ? t.verified.gold : t.verified.blue}
    >
      <Path
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        fill={color}
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="#FFFFFF" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
