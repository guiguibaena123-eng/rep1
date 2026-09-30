import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

import { Screen } from './Screen';
import { Text } from './Text';

const PHRASE_MS = 3000;

export type WaitingScreenProps = {
  /** Frases que se revezam a cada 3s. */
  phrases: readonly string[];
  /** Texto menor, fixo, abaixo da frase. */
  wait: string;
};

/** Espera pela IA (T8 e análise do LinkedIn): três pontinhos animados e frases rotativas. */
export function WaitingScreen({ phrases, wait }: WaitingScreenProps) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % phrases.length), PHRASE_MS);
    return () => clearInterval(timer);
  }, [phrases.length]);

  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <Dots />
        <View style={styles.texts} accessibilityLiveRegion="polite">
          <Text variant="screenTitle" align="center" style={{ fontSize: 22, lineHeight: 28 }}>
            {phrases[idx]}
          </Text>
          <Text variant="bodySmall" color="textSecondary" align="center">
            {wait}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

/** Três pontinhos que sobem e descem, em sequência. */
function Dots() {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const a = useSharedValue(0);
  const b = useSharedValue(0);
  const c = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const bob = (delay: number) =>
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
        ),
      );
    a.set(bob(0));
    b.set(bob(150));
    c.set(bob(300));
  }, [reduceMotion, a, b, c]);

  return (
    <View
      style={[styles.bubble, { backgroundColor: colors.primarySoft }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {[a, b, c].map((v, i) => (
        <Dot key={i} value={v} color={colors.primary} still={reduceMotion} />
      ))}
    </View>
  );
}

function Dot({ value, color, still }: { value: SharedValue<number>; color: string; still: boolean }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -14 * value.get() }],
    opacity: still ? 1 : 0.45 + 0.55 * value.get(),
  }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 36, paddingHorizontal: space[3] },
  texts: { gap: space[2], minHeight: 64 },
  bubble: { width: 160, height: 160, borderRadius: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  dot: { width: 16, height: 16, borderRadius: 8 },
});
