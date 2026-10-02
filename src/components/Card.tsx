import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import { brandSurface, radius, shadowElevated, space } from '@/theme/tokens';

export type CardProps = {
  children: ReactNode;
  /**
   * default = branco com borda fina; highlight = azul 10% sem borda;
   * brand = degradê da marca ("fôlego"), um só por tela, para a ação principal. Texto em brandSurface.ink.
   */
  variant?: 'default' | 'highlight' | 'brand';
  /** Sombra suave: só para cards elevados. O padrão do design é borda, não sombra. */
  elevated?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Card/Default e Card/Highlight do design (raio 20, padding 16–20). */
export function Card({ children, variant = 'default', elevated, onPress, accessibilityLabel, style }: CardProps) {
  const { colors } = useTheme();
  const look: ViewStyle =
    variant === 'brand'
      ? { backgroundColor: brandSurface.gradient[1], overflow: 'hidden' }
      : variant === 'highlight'
        ? { backgroundColor: colors.primarySoft }
        : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border };

  const content = [styles.card, look, elevated && shadowElevated, style];
  const body = variant === 'brand' ? (
    <>
      <BrandGradient />
      {children}
    </>
  ) : (
    children
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [content, pressed && { opacity: 0.85 }]}
      >
        {body}
      </Pressable>
    );
  }
  return <View style={content}>{body}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, padding: space[5] - 2 },
});

/** Fundo do Card brand: degradê na diagonal, do canto do texto (escuro) ao oposto (claro). */
function BrandGradient() {
  const [from, mid, to] = brandSurface.gradient;
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" pointerEvents="none">
      <Defs>
        <LinearGradient id="siwkiBreath" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="0.55" stopColor={mid} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#siwkiBreath)" />
    </Svg>
  );
}
