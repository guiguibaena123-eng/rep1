import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts, typeScale, type ColorTokens, type TypeVariant } from '@/theme/tokens';

type Weight = 'regular' | 'medium' | 'semibold';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  /** Nome de uma cor dos tokens (ex.: 'textSecondary'). Padrão: 'text'. */
  color?: keyof ColorTokens;
  /** Só para variantes de corpo (Inter). Títulos já têm o peso certo. */
  weight?: Weight;
  align?: 'left' | 'center' | 'right';
};

const bodyWeights: Record<Weight, string> = {
  regular: fonts.body400,
  medium: fonts.body500,
  semibold: fonts.body600,
};

const isHeading = (v: TypeVariant) =>
  v === 'display' || v === 'screenTitle' || v === 'sectionTitle' || v === 'cardTitle' || v === 'brandDisplay' || v === 'brandTitle';

export function Text({ variant = 'body', color = 'text', weight, align, style, ...rest }: TextProps) {
  const { colors } = useTheme();
  const base = typeScale[variant];
  const fontFamily = weight && !isHeading(variant) ? bodyWeights[weight] : base.fontFamily;

  return (
    <RNText
      style={[base, { fontFamily, color: colors[color], textAlign: align }, style]}
      {...rest}
    />
  );
}
