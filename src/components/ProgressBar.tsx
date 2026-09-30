import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius, size } from '@/theme/tokens';

export type ProgressBarProps = {
  /** De 0 a 1. */
  value: number;
  /** Texto lido pelo leitor de tela (ex.: "1 de 3 simulações"). */
  accessibilityLabel: string;
};

/**
 * Progress/InProgress e Progress/Complete: barra fina de 8px.
 * Preenche em índigo; fica menta quando completa. Anima ao carregar.
 */
export function ProgressBar({ value, accessibilityLabel }: ProgressBarProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const clamped = Math.min(1, Math.max(0, value));
  const progress = useSharedValue(reduceMotion ? clamped : 0);

  useEffect(() => {
    progress.set(reduceMotion ? clamped : withTiming(clamped, { duration: motion.slow }));
  }, [clamped, reduceMotion, progress]);

  const fill = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));
  const complete = clamped >= 1;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { backgroundColor: colors.border }]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: complete ? colors.success : colors.primary }, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: size.progressHeight, borderRadius: radius.chip, overflow: 'hidden' },
  fill: { height: size.progressHeight, borderRadius: radius.chip },
});
