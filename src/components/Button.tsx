import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius, size, space } from '@/theme/tokens';

import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'text';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Mostra o spinner no lugar do texto e bloqueia novos toques (evita clique duplo). */
  loading?: boolean;
  /** Ícone opcional antes do texto (ex.: <Lightbulb />). */
  icon?: ReactNode;
  /** Largura total (padrão para primary/secondary). */
  fullWidth?: boolean;
  /** Altura 48 em vez de 52 (botões dentro de cards e estados vazios). */
  compact?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Button/Primary, Button/Secondary e Button/Text do design.
 * Estados: normal, pressionado (escala 0.97 + cor mais escura), desabilitado e carregando.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  fullWidth = variant !== 'text',
  compact = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const inactive = disabled || loading;

  const pressTo = (value: number) => {
    if (reduceMotion) return;
    // .set() em vez de .value = : compatível com o React Compiler (Reanimated 4).
    scale.set(withTiming(value, { duration: motion.fast }));
  };

  const palette = (pressed: boolean) => {
    if (variant === 'text') {
      return { bg: 'transparent', fg: disabled ? colors.textDisabled : colors.primary };
    }
    if (disabled) return { bg: colors.border, fg: colors.textDisabled };
    if (variant === 'secondary') return { bg: colors.primarySoft, fg: colors.primaryInk };
    return { bg: pressed ? colors.primaryPressed : colors.primary, fg: colors.onPrimary };
  };

  return (
    <Animated.View style={[fullWidth && styles.full, animated, style]}>
      <Pressable
        testID={testID}
        onPress={inactive ? undefined : onPress}
        onPressIn={() => pressTo(motion.pressScale)}
        onPressOut={() => pressTo(1)}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityLabel={loading ? t.common.loading : (accessibilityLabel ?? label)}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: inactive, busy: loading }}
        style={({ pressed }) => {
          const p = palette(pressed);
          return [
            variant === 'text' ? styles.textButton : styles.button,
            compact && styles.compact,
            { backgroundColor: p.bg },
          ];
        }}
      >
        {({ pressed }) => {
          const p = palette(pressed);
          if (loading) return <ActivityIndicator color={p.fg} />;
          return (
            <View style={styles.content}>
              {icon}
              <Text variant="button" style={{ color: p.fg }} numberOfLines={2} align="center">
                {label}
              </Text>
            </View>
          );
        }}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  full: { alignSelf: 'stretch' },
  button: {
    minHeight: size.buttonHeight,
    borderRadius: radius.button,
    paddingHorizontal: space[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { minHeight: size.minTouch },
  textButton: {
    minHeight: size.minTouch,
    paddingHorizontal: space[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
