import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { t } from '@/i18n';
import { clampScore, scoreBand, scoreColors } from '@/lib/score';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, motion } from '@/theme/tokens';

import { Text } from './Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const R = 52;
const CIRCUMFERENCE = 2 * Math.PI * R;

export type ScoreRingProps = {
  /** Nota de 0 a 100. */
  score: number;
  /** sm = 96px (listas/biblioteca), lg = 150px (topo de T9 e T12). */
  size?: 'sm' | 'lg';
  /** Mostra o texto gentil da faixa abaixo do anel ("Mandou bem", …). */
  showLabel?: boolean;
};

/**
 * ScoreRing/High, /Mid e /Low. A cor muda com a faixa, mas sempre há texto junto
 * (a cor nunca é a única pista).
 */
export function ScoreRing({ score, size = 'sm', showLabel = size === 'sm' }: ScoreRingProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const value = clampScore(score);
  const band = scoreBand(value);
  const { ring, ink } = scoreColors(band, colors);
  const label = t.scoreRing[band];

  const px = size === 'lg' ? 150 : 96;
  const stroke = size === 'lg' ? 9 : 10;
  const target = CIRCUMFERENCE * (1 - value / 100);

  const offset = useSharedValue(reduceMotion ? target : CIRCUMFERENCE);
  useEffect(() => {
    offset.set(reduceMotion ? target : withTiming(target, { duration: size === 'lg' ? motion.breath : 700, easing: Easing.out(Easing.cubic) }));
  }, [target, reduceMotion, offset, size]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: offset.get() }));

  return (
    <View style={styles.wrapper} accessible accessibilityRole="image" accessibilityLabel={t.scoreRing.a11y(value, label)}>
      <View style={{ width: px, height: px }}>
        <Svg width={px} height={px} viewBox="0 0 120 120">
          <Circle cx={60} cy={60} r={R} fill="none" stroke={colors.border} strokeWidth={stroke} />
          <AnimatedCircle
            cx={60}
            cy={60}
            r={R}
            fill="none"
            stroke={ring}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            animatedProps={animatedProps}
            transform="rotate(-90 60 60)"
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text
            style={{
              fontFamily: fonts.heading800,
              fontSize: size === 'lg' ? 40 : 26,
              lineHeight: size === 'lg' ? 44 : 32,
            }}
          >
            {value}
          </Text>
          {size === 'lg' && (
            <Text variant="caption" color="textSecondary">
              {t.scoreRing.outOf}
            </Text>
          )}
        </View>
      </View>
      {showLabel && (
        <Text variant="caption" weight="semibold" style={{ color: ink }}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 6 },
  center: { alignItems: 'center', justifyContent: 'center' },
});
