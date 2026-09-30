import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, shadowElevated, space } from '@/theme/tokens';

export type CardProps = {
  children: ReactNode;
  /** default = branco com borda fina; highlight = índigo 10% sem borda. */
  variant?: 'default' | 'highlight';
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
    variant === 'highlight'
      ? { backgroundColor: colors.primarySoft }
      : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border };

  const content = [styles.card, look, elevated && shadowElevated, style];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [content, pressed && { opacity: 0.85 }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={content}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, padding: space[5] - 2 },
});
