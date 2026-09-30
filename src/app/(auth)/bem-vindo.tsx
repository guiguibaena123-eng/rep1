import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Button, Text } from '@/components';
import { usePreferences } from '@/features/preferences/store';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { screenPadding, type ColorTokens } from '@/theme/tokens';

/** T2 Boas-vindas: 3 slides; "Pular" e "Começar" levam a T3 (Criar conta). */
export default function WelcomeScreen() {
  const slides = t.welcome.slides; // lido na hora: segue o idioma atual
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const markWelcomeSeen = usePreferences((s) => s.markWelcomeSeen);
  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;
  const slide = slides[index];

  // Marcar como visto já basta: a rota de boas-vindas fica bloqueada e o app abre T3.
  const finish = () => markWelcomeSeen();

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Button label={t.welcome.skip} variant="text" onPress={finish} />
      </View>

      {/* Ilustração ocupa ~40% da tela (encolhe em celulares pequenos). */}
      <View style={[styles.art, { height: Math.min(300, height * 0.36) }]}>
        <Animated.View key={index} entering={FadeInDown.duration(220)} style={{ transform: [{ scale: Math.min(1, (height * 0.36) / 300) }] }}>
          <Illustration index={index} colors={colors} />
        </Animated.View>
      </View>

      <View style={styles.copy}>
        <Text variant="display" accessibilityRole="header">
          {slide.title}
        </Text>
        <Text color="textSecondary">{slide.text}</Text>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}>
        <View style={styles.dots} accessible accessibilityLabel={t.welcome.step(index + 1)}>
          {slides.map((_, k) => (
            <View
              key={k}
              style={[
                styles.dot,
                { width: k === index ? 24 : 8, backgroundColor: k === index ? colors.primary : colors.dotInactive },
              ]}
            />
          ))}
        </View>
        <Button
          label={isLast ? t.welcome.start : t.welcome.next}
          onPress={isLast ? finish : () => setIndex(index + 1)}
        />
      </View>
    </View>
  );
}

/** Ilustrações geométricas do design (formas simples nas cores da marca). */
function Illustration({ index, colors: c }: { index: number; colors: ColorTokens }) {
  if (index === 0) {
    return (
      <Svg width={300} height={260} viewBox="0 0 300 260" accessibilityElementsHidden importantForAccessibility="no">
        <Circle cx={150} cy={130} r={112} fill={c.primarySoft} />
        <Circle cx={150} cy={130} r={72} fill={c.surface} />
        <Circle cx={150} cy={130} r={36} fill={c.primary} />
        <Circle cx={244} cy={54} r={18} fill={c.warning} />
        <Circle cx={62} cy={206} r={12} fill={c.success} />
      </Svg>
    );
  }
  if (index === 1) {
    return (
      <Svg width={300} height={260} viewBox="0 0 300 260" accessibilityElementsHidden importantForAccessibility="no">
        <Rect x={38} y={40} width={170} height={104} rx={28} fill={c.primary} />
        <Path d="M70 144v34l32-34z" fill={c.primary} />
        <Rect x={112} y={118} width={150} height={92} rx={28} fill={c.successSoft} />
        <Path d="m160 164 16 16 34-34" stroke={c.success} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={76} cy={92} r={8} fill="#FFFFFF" />
        <Circle cx={104} cy={92} r={8} fill="#FFFFFF" />
        <Circle cx={132} cy={92} r={8} fill="#FFFFFF" />
      </Svg>
    );
  }
  return (
    <Svg width={300} height={260} viewBox="0 0 300 260" accessibilityElementsHidden importantForAccessibility="no">
      <Rect x={70} y={30} width={160} height={200} rx={28} fill={c.surface} stroke={c.border} strokeWidth={2} />
      <Circle cx={150} cy={96} r={34} fill={c.primarySoft} />
      <Circle cx={150} cy={90} r={14} fill={c.primary} />
      <Rect x={104} y={146} width={92} height={12} rx={6} fill={c.primary} />
      <Rect x={116} y={170} width={68} height={10} rx={5} fill={c.border} />
      <Circle cx={238} cy={52} r={26} fill={c.warning} />
      <Path d="m228 52 7 7 14-14" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { height: 56, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 8 },
  art: { alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, paddingTop: 32, paddingHorizontal: screenPadding, gap: 12 },
  footer: { paddingHorizontal: screenPadding, gap: 28 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { height: 8, borderRadius: 999 },
});
