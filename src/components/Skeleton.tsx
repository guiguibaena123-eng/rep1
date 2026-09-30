import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

type BlockProps = { width: DimensionValue; height: DimensionValue; soft?: boolean; radius?: number };

function Block({ width, height, soft, radius: r = 8 }: BlockProps) {
  const { colors } = useTheme();
  return (
    <View style={{ width, height, borderRadius: r, backgroundColor: soft ? colors.skeletonSoft : colors.border }} />
  );
}

/** Pulsação suave (1 → 0.45 → 1 em 1,4s). Parada se "reduzir movimento" estiver ligado. */
function usePulse() {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) return;
    opacity.set(withRepeat(withTiming(0.45, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [reduceMotion, opacity]);
  return useAnimatedStyle(() => ({ opacity: opacity.get() }));
}

/** Skeleton/Card: blocos cinza pulsando enquanto carrega (nunca tela em branco). */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  const { colors } = useTheme();
  const pulse = usePulse();
  const widths: DimensionValue[] = ['60%', '90%', '40%', '75%'];
  return (
    <Animated.View
      accessibilityLabel={t.common.loading}
      accessibilityRole="progressbar"
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, pulse]}
    >
      {Array.from({ length: lines }, (_, i) => (
        <Block key={i} width={widths[i % widths.length]} height={i === 0 ? 14 : 12} soft={i > 0} />
      ))}
    </Animated.View>
  );
}

/** Bloco solto para montar skeletons específicos de cada tela. */
export function Skeleton(props: BlockProps) {
  const pulse = usePulse();
  return (
    <Animated.View style={[pulse, typeof props.height === 'string' && { height: props.height }]} accessibilityLabel={t.common.loading}>
      <Block {...props} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { padding: space[5] - 2, borderRadius: radius.card, borderWidth: 1, gap: 10 },
});
