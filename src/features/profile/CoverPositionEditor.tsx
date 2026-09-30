import { Image, type ImageRef } from 'expo-image';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Button, Skeleton, Text } from '@/components';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, screenPadding, size, space } from '@/theme/tokens';

import { COVER_RATIO, coverFit, dragPosition, usePhotoUrl } from './photo';

const e = t.editProfile;
/** Passo das ações do leitor de tela (deslizar para cima/baixo). */
const A11Y_STEP = 10;

export type CoverPosition = { x: number; y: number };

type Props = {
  path: string | null;
  /** Capa recém-escolhida, ainda no celular. */
  localUri?: string | null;
  initial: CoverPosition;
  onSave: (position: CoverPosition) => void;
  onClose: () => void;
};

/**
 * "Ajustar capa": a pessoa arrasta a imagem para escolher a parte que aparece.
 * Tela cheia (Modal) com a moldura no formato real da capa. Montado só quando aberto.
 * Leitor de tela: a moldura é "ajustável" (deslizar para cima/baixo move 10%).
 */
export function CoverPositionEditor({ path, localUri, initial, onSave, onClose }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const url = usePhotoUrl(localUri ? null : path);
  const uri = localUri ?? url.data ?? null;

  const [frame, setFrame] = useState<{ width: number; height: number } | null>(null);
  // Carrega a imagem antes de mostrar, para saber as medidas. (Esperar o onLoad não funcionava:
  // a imagem começava com tamanho 0×0 e, sem tamanho, nunca carregava.)
  const [image, setImage] = useState<ImageRef | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!uri) return;
    let cancelled = false;
    Image.loadAsync(uri)
      .then((ref) => !cancelled && setImage(ref))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [uri]);
  // Posição "oficial" (React) e a do arraste (UI thread, sem travar a animação).
  const [pos, setPos] = useState(initial);
  const px = useSharedValue(initial.x);
  const py = useSharedValue(initial.y);
  const startX = useSharedValue(initial.x);
  const startY = useSharedValue(initial.y);

  const fit = frame && image ? coverFit(frame.width, frame.height, image.width, image.height) : null;
  const ox = fit?.ox ?? 0;
  const oy = fit?.oy ?? 0;
  // A imagem só "sobra" para um lado: é nele que dá para arrastar.
  const axis: 'x' | 'y' = ox > oy ? 'x' : 'y';

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.set(px.get());
      startY.set(py.get());
    })
    .onUpdate((ev) => {
      if (ox > 0) px.set(Math.min(100, Math.max(0, startX.get() - (ev.translationX / ox) * 100)));
      if (oy > 0) py.set(Math.min(100, Math.max(0, startY.get() - (ev.translationY / oy) * 100)));
    })
    .onEnd(() => {
      scheduleOnRN(setPos, { x: Math.round(px.get()), y: Math.round(py.get()) });
    });

  const moved = useAnimatedStyle(() => ({
    transform: [{ translateX: (-ox * px.get()) / 100 }, { translateY: (-oy * py.get()) / 100 }],
  }));

  const moveTo = (next: CoverPosition) => {
    px.set(next.x);
    py.set(next.y);
    setPos(next);
  };

  const step = (dir: 1 | -1) => {
    const overflow = axis === 'x' ? ox : oy;
    const delta = (-dir * A11Y_STEP * overflow) / 100;
    moveTo(axis === 'x' ? { ...pos, x: dragPosition(pos.x, delta, ox) } : { ...pos, y: dragPosition(pos.y, delta, oy) });
  };

  const value = axis === 'x' ? pos.x : pos.y;
  const where = value <= 33 ? 'start' : value >= 67 ? 'end' : 'middle';

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <GestureHandlerRootView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + space[1] }]}>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t.common.close} style={styles.iconButton}>
            <X size={24} color={colors.text} strokeWidth={iconStroke} />
          </Pressable>
          <Text accessibilityRole="header" style={styles.title}>
            {e.coverAdjustTitle}
          </Text>
        </View>

        <View style={styles.body}>
          <Text color="textSecondary">{e.coverAdjustHint}</Text>

          <GestureDetector gesture={pan}>
            <View
              onLayout={(ev) => setFrame({ width: ev.nativeEvent.layout.width, height: ev.nativeEvent.layout.height })}
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel={e.coverAdjustA11y}
              accessibilityValue={{ text: e.coverPlace[axis][where] }}
              accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
              onAccessibilityAction={(ev) => step(ev.nativeEvent.actionName === 'increment' ? 1 : -1)}
              style={[styles.frame, { backgroundColor: colors.primarySoft }]}
            >
              {failed ? (
                <View style={styles.center}>
                  <Text variant="bodySmall" color="textSecondary" align="center">
                    {e.coverLoadError}
                  </Text>
                </View>
              ) : !fit || !image ? (
                <View style={StyleSheet.absoluteFill}>
                  <Skeleton width="100%" height="100%" radius={0} />
                </View>
              ) : (
                <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: fit.width, height: fit.height }, moved]}>
                  <Image source={image} style={StyleSheet.absoluteFill} contentFit="fill" />
                </Animated.View>
              )}
            </View>
          </GestureDetector>

          <Button
            label={e.coverAdjustCenter}
            variant="text"
            onPress={() => moveTo({ x: 50, y: 50 })}
            style={styles.inlineAction}
          />
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, space[5]) + space[3] }]}>
          <Button label={e.coverAdjustSave} onPress={() => onSave({ x: Math.round(px.get()), y: Math.round(py.get()) })} />
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingLeft: space[2], paddingRight: screenPadding },
  iconButton: { width: size.minTouch, height: size.minTouch, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.heading700, fontSize: 20, lineHeight: 26, flexShrink: 1 },
  body: { flex: 1, paddingHorizontal: screenPadding, paddingTop: space[5], gap: space[4] },
  frame: { width: '100%', aspectRatio: COVER_RATIO, borderRadius: radius.card, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space[4] },
  inlineAction: { alignSelf: 'flex-start', marginHorizontal: -space[4] },
  footer: { paddingHorizontal: screenPadding, paddingTop: space[4], borderTopWidth: 1 },
});
