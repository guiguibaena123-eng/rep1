import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { APP_NAME, t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { lightColors, radius, screenPadding, size, space } from '@/theme/tokens';

import { useIntroFlight } from './introFlight';
import {
  BAG_TRANSFORM,
  BAG_WIDE_LEN,
  BAG_WIDEN,
  BRAND_BLUE_BOTTOM,
  BRAND_BLUE_TOP,
  CHECK_DOT,
  CheckMask,
  DOT,
  LETTERS,
  LOGO_RATIO,
  LOGO_VIEWBOX,
  TAB_ICON_HEIGHT,
  WORD_TRANSFORM,
  bagPath,
} from './Logo';
import { brandLogoTop } from './Screen';
import { Text } from './Text';

const APath = Animated.createAnimatedComponent(Path);
const AG = Animated.createAnimatedComponent(G);
const ACircle = Animated.createAnimatedComponent(Circle);

/** Tamanho do logo na abertura (ele encolhe até TAB_LOGO_HEIGHT no voo). */
const SPLASH_H = 64;
const SPLASH_W = SPLASH_H * LOGO_RATIO;

/*
 * Pouso: só a maleta (esticada) vai para o canto; o nome some no caminho.
 * Conta das escalas: o logo inteiro tem 320 unidades de altura; a maleta está desenhada em
 * escala 0.42 dentro dele; o ícone do canto (BagLogo) mostra 628 unidades da maleta.
 */
const PX_PER_LOGO_UNIT = SPLASH_H / 320;
const END_SCALE = TAB_ICON_HEIGHT / 628 / (PX_PER_LOGO_UNIT * 0.42);
/** Canto superior esquerdo da maleta esticada dentro do logo da abertura (px, antes de encolher). */
const BAG_LEFT = ((200 - BAG_WIDEN - 24 - 510) * 0.42 + 357 - 180) * PX_PER_LOGO_UNIT;
const BAG_TOP = ((226 - 540) * 0.42 + 254 + 42 - 150) * PX_PER_LOGO_UNIT;

/*
 * Linha do tempo do desenho (0 → 1 em DRAW_MS): a maleta se desenha, as letras são escritas
 * uma depois da outra (com sobreposição, como uma mão escrevendo) e, por fim, os pingos "saltam".
 */
const DRAW_MS = 1700;
const BAG_SPAN: Span = [0, 0.42];
const LETTER_SPANS: Span[] = [
  [0.3, 0.5],
  [0.44, 0.56],
  [0.5, 0.7],
  [0.6, 0.8],
  [0.72, 0.86],
];
const DOT_SPAN: Span = [0.84, 1];
type Span = [number, number];

/** Parte de `p` dentro do trecho [a, b], de 0 a 1. */
function seg(p: number, [a, b]: Span) {
  'worklet';
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

/** Passa um pouco do tamanho e volta (o "salto" dos pingos). */
function backOut(x: number) {
  'worklet';
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export type BrandSplashProps = {
  /** A pessoa já tocou em "Vamos começar!" (o botão some). */
  started: boolean;
  /** Sessão e perfil carregados: dá para sair da abertura. */
  ready: boolean;
  /** A próxima tela é a Início (abas): o logo voa até o canto dela. Senão, só some. */
  toHome: boolean;
  onContinue: () => void;
  /** A animação de saída acabou: a abertura pode ser tirada da tela. */
  onExited: () => void;
};

/**
 * T1 Abertura: fundo índigo e o logo branco se desenhando (maleta, letras e o ✓).
 * O logo flutua, reage ao toque (salto + onda) e pode ser arrastado (volta com mola).
 * Em "Vamos começar!", o logo voa até o canto superior esquerdo da Início e encolhe até o
 * tamanho de lá, enquanto o fundo índigo some; no tema claro ele passa de branco para o azul
 * da marca no caminho (no escuro continua branco). Com "reduzir movimento": só esmaece.
 */
export function BrandSplash({ started, ready, toHome, onContinue, onExited }: BrandSplashProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const land = useIntroFlight((s) => s.land);

  const progress = useSharedValue(reduceMotion ? 1 : 0); // desenho
  const pop = useSharedValue(1); // tamanho extra dos pingos (toque)
  const float = useSharedValue(0); // flutuar
  const press = useSharedValue(1); // escala do toque
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const ripple = useSharedValue(1); // onda do toque (1 = invisível)
  const flight = useSharedValue(0); // 0 = centro; 1 = canto da Início
  const tint = useSharedValue(0); // 0 = branco; 1 = azul da marca
  const fade = useSharedValue(1); // opacidade do logo (saída sem voo)
  const backdrop = useSharedValue(1); // opacidade do fundo índigo
  const ui = useSharedValue(1); // opacidade do botão

  // Entrada: desenha o logo e depois começa a flutuar.
  useEffect(() => {
    if (reduceMotion) return;
    progress.set(withTiming(1, { duration: DRAW_MS, easing: Easing.inOut(Easing.cubic) }));
    float.set(
      withDelay(
        DRAW_MS,
        withRepeat(
          withSequence(
            withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
        ),
      ),
    );
  }, [reduceMotion, progress, float]);

  // Saída: começa uma vez só, quando a pessoa tocou e tudo carregou.
  const exiting = started && ready;
  const exitStarted = useRef(false);
  useEffect(() => {
    if (!exiting || exitStarted.current) return;
    exitStarted.current = true;

    const finish = () => {
      land();
      onExited();
    };

    ui.set(withTiming(0, { duration: 180 }));
    if (reduceMotion) {
      progress.set(1);
      backdrop.set(withTiming(0, { duration: 250 }));
      fade.set(withTiming(0, { duration: 250 }, (done) => done && scheduleOnRN(finish)));
      return;
    }
    if (!toHome) {
      // Login, cadastro ou "Conhecendo você": o logo cresce um pouco e some com o fundo.
      progress.set(withTiming(1, { duration: 200 }));
      press.set(withTiming(1.12, { duration: 450, easing: Easing.out(Easing.cubic) }));
      fade.set(withTiming(0, { duration: 400 }));
      backdrop.set(withDelay(100, withTiming(0, { duration: 400 }, (done) => done && scheduleOnRN(finish))));
      return;
    }
    // Início: termina o desenho (se tocou antes), toma impulso e voa para o canto.
    progress.set(withTiming(1, { duration: 250 }));
    dragX.set(withTiming(0, { duration: 200 }));
    dragY.set(withTiming(0, { duration: 200 }));
    flight.set(
      withDelay(
        150,
        withTiming(1, { duration: 950, easing: Easing.bezier(0.5, -0.3, 0.15, 1) }, (done) => done && scheduleOnRN(finish)),
      ),
    );
    if (!isDark) tint.set(withDelay(450, withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) })));
    backdrop.set(withDelay(420, withTiming(0, { duration: 650, easing: Easing.out(Easing.quad) })));
  }, [exiting, toHome, isDark, reduceMotion, land, onExited, ui, progress, backdrop, fade, press, dragX, dragY, flight, tint]);

  // Onde a maleta pousa: exatamente a do canto da Início (Screen com `brand`).
  const targetTop = brandLogoTop(insets.top);
  const startDx = (W - SPLASH_W) / 2 - screenPadding;
  const startDy = H * 0.42 - SPLASH_H / 2 - targetTop;
  const endDx = -BAG_LEFT * END_SCALE;
  const endDy = -BAG_TOP * END_SCALE;

  const logoStyle = useAnimatedStyle(() => {
    const f = flight.get();
    const loose = 1 - Math.min(1, Math.max(0, f)); // flutuar e arrastar só valem antes do voo
    return {
      opacity: fade.get(),
      transform: [
        { translateX: startDx * (1 - f) + endDx * f + dragX.get() * loose },
        // Um arco para cima no meio do caminho deixa o voo mais natural.
        {
          translateY:
            startDy * (1 - f) + endDy * f + (float.get() + dragY.get()) * loose - Math.sin(Math.PI * f) * 28,
        },
        { scale: interpolate(f, [0, 1], [1, END_SCALE]) * press.get() },
        { rotate: `${dragX.get() * 0.04 * loose}deg` },
      ],
    };
  });

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ripple.get(), [0, 1], [0.45, 0]),
    transform: [{ scale: interpolate(ripple.get(), [0, 1], [0.35, 1.25]) }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.get() }));
  const uiStyle = useAnimatedStyle(() => ({ opacity: ui.get() }));

  const tapFeedback = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  const releaseFeedback = () => Haptics.selectionAsync().catch(() => {});

  // Toque: salto, pingos maiores e uma onda. Arrastar: o logo segue com resistência e volta com mola.
  const tap = Gesture.Tap().onEnd(() => {
    if (flight.get() > 0) return;
    scheduleOnRN(tapFeedback);
    press.set(withSequence(withTiming(0.9, { duration: 90 }), withSpring(1, { damping: 6, stiffness: 220 })));
    pop.set(withSequence(withTiming(1.5, { duration: 120 }), withSpring(1, { damping: 5, stiffness: 180 })));
    ripple.set(0);
    ripple.set(withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) }));
  });
  const drag = Gesture.Pan()
    .onChange((e) => {
      if (flight.get() > 0) return;
      dragX.set(e.translationX * 0.4);
      dragY.set(e.translationY * 0.4);
    })
    .onEnd(() => {
      scheduleOnRN(releaseFeedback);
      dragX.set(withSpring(0, { damping: 7, stiffness: 160 }));
      dragY.set(withSpring(0, { damping: 7, stiffness: 160 }));
    });
  const gesture = Gesture.Exclusive(drag, tap);

  const start = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onContinue();
  };

  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill} pointerEvents={exiting ? 'none' : 'auto'}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />

      <View style={StyleSheet.absoluteFill} accessible accessibilityLabel={t.brand.open} pointerEvents="box-none">
        <Animated.View
          style={[styles.logo, { top: targetTop, width: SPLASH_W, height: SPLASH_H }, logoStyle]}
        >
          <Animated.View pointerEvents="none" style={[styles.ripple, rippleStyle]} />
          <GestureDetector gesture={gesture}>
            <View accessibilityLabel={APP_NAME} accessibilityRole="image">
              <AnimatedLogo progress={progress} pop={pop} tint={tint} flight={flight} withBrand={!isDark} />
            </View>
          </GestureDetector>
        </Animated.View>
      </View>

      {!started && (
        <Animated.View
          entering={FadeInDown.delay(reduceMotion ? 0 : DRAW_MS - 300).duration(350)}
          style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space[5]) + space[3] }]}
        >
          <Animated.View style={uiStyle}>
            <Pressable
              onPress={start}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
            >
              <Text style={styles.buttonText}>{t.brand.letsGo}</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </GestureHandlerRootView>
  );
}

/**
 * O logo com os traços animados. São duas camadas iguais (branca e azul da marca) e `tint`
 * troca uma pela outra: é a transição de cor durante o voo.
 */
function AnimatedLogo({
  progress,
  pop,
  tint,
  flight,
  withBrand,
}: {
  progress: SharedValue<number>;
  pop: SharedValue<number>;
  tint: SharedValue<number>;
  flight: SharedValue<number>;
  withBrand: boolean;
}) {
  const whiteProps = useAnimatedProps(() => ({ opacity: 1 - tint.get() }));
  const brandProps = useAnimatedProps(() => ({ opacity: tint.get() }));
  return (
    <Svg width={SPLASH_W} height={SPLASH_H} viewBox={LOGO_VIEWBOX}>
      <Defs>
        <LinearGradient id="splash-gi" gradientUnits="userSpaceOnUse" x1="0" y1="226" x2="0" y2="854">
          <Stop offset="0" stopColor={BRAND_BLUE_TOP} />
          <Stop offset="1" stopColor={BRAND_BLUE_BOTTOM} />
        </LinearGradient>
        <LinearGradient id="splash-gw" gradientUnits="userSpaceOnUse" x1="0" y1="8" x2="0" y2="146">
          <Stop offset="0" stopColor={BRAND_BLUE_TOP} />
          <Stop offset="1" stopColor={BRAND_BLUE_BOTTOM} />
        </LinearGradient>
        <CheckMask id="splash-ck" />
      </Defs>
      <AG animatedProps={whiteProps}>
        <LogoLayer bag="#FFFFFF" word="#FFFFFF" progress={progress} pop={pop} flight={flight} />
      </AG>
      {withBrand && (
        <AG animatedProps={brandProps}>
          <LogoLayer bag="url(#splash-gi)" word="url(#splash-gw)" progress={progress} pop={pop} flight={flight} />
        </AG>
      )}
    </Svg>
  );
}

function LogoLayer({
  bag,
  word,
  progress,
  pop,
  flight,
}: {
  bag: string;
  word: string;
  progress: SharedValue<number>;
  pop: SharedValue<number>;
  flight: SharedValue<number>;
}) {
  // No voo, o nome some logo no começo: só a maleta chega ao canto.
  const wordProps = useAnimatedProps(() => ({ opacity: 1 - Math.min(1, Math.max(0, flight.get() * 2.2)) }));
  return (
    <G transform="translate(0,42)">
      <G transform={BAG_TRANSFORM}>
        <BagDrawPath stroke={bag} progress={progress} flight={flight} />
      </G>
      <AG transform={WORD_TRANSFORM} animatedProps={wordProps}>
        {LETTERS.map((l, i) => (
          <DrawPath key={l.d} d={l.d} len={l.len} span={LETTER_SPANS[i]} stroke={word} width={10} progress={progress} />
        ))}
        <PopDot {...DOT} fill={word} progress={progress} pop={pop} />
        <PopDot {...CHECK_DOT} fill={word} mask="url(#splash-ck)" progress={progress} pop={pop} />
      </AG>
    </G>
  );
}

/** A maleta: se desenha como os outros traços e, no voo, estica para os lados até o formato do canto. */
function BagDrawPath({
  stroke,
  progress,
  flight,
}: {
  stroke: string;
  progress: SharedValue<number>;
  flight: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    const t = seg(progress.get(), BAG_SPAN);
    const w = BAG_WIDEN * Math.min(1, Math.max(0, flight.get()));
    return { d: bagPath(w), strokeDashoffset: BAG_WIDE_LEN * (1 - t), strokeOpacity: t > 0.001 ? 1 : 0 };
  });
  return (
    <APath
      d={bagPath(0)}
      fill="none"
      stroke={stroke}
      strokeWidth={48}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={[BAG_WIDE_LEN, BAG_WIDE_LEN]}
      animatedProps={animatedProps}
    />
  );
}

/** Um traço que "se desenha": o tracejado do tamanho do traço desliza até aparecer inteiro. */
function DrawPath({
  d,
  len,
  span,
  stroke,
  width,
  progress,
}: {
  d: string;
  len: number;
  span: Span;
  stroke: string;
  width: number;
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    const t = seg(progress.get(), span);
    // Antes de começar, some de vez (a ponta arredondada deixaria um pontinho).
    return { strokeDashoffset: len * (1 - t), strokeOpacity: t > 0.001 ? 1 : 0 };
  });
  return (
    <APath
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={[len, len]}
      animatedProps={animatedProps}
    />
  );
}

/** Pingo que salta no fim do desenho (e de novo a cada toque). */
function PopDot({
  cx,
  cy,
  r,
  fill,
  mask,
  progress,
  pop,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  mask?: string;
  progress: SharedValue<number>;
  pop: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => ({
    r: Math.max(0, r * backOut(seg(progress.get(), DOT_SPAN)) * pop.get()),
  }));
  return <ACircle cx={cx} cy={cy} fill={fill} mask={mask} animatedProps={animatedProps} />;
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: lightColors.primary },
  logo: { position: 'absolute', left: screenPadding, transformOrigin: 'left top' },
  ripple: {
    position: 'absolute',
    left: SPLASH_W / 2 - SPLASH_W * 0.6,
    top: SPLASH_H / 2 - SPLASH_W * 0.6,
    width: SPLASH_W * 1.2,
    height: SPLASH_W * 1.2,
    borderRadius: SPLASH_W * 0.6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: screenPadding },
  button: {
    minHeight: size.buttonHeight,
    borderRadius: radius.button,
    backgroundColor: lightColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 24, color: lightColors.primary },
});
