import { useEffect, type ReactNode } from 'react';
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, screenPadding, shadowElevated, space } from '@/theme/tokens';

import { Text } from './Text';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  /** Botões e conteúdo extra. Ação principal primeiro (Button primary), depois a de texto. */
  children?: ReactNode;
  /** "center": caixa no meio da tela que sobe com o teclado. Use quando houver campo de texto. */
  placement?: 'bottom' | 'center';
  /** Ícone ou ilustração acima do título (ex.: tela de limite, conquista). */
  icon?: ReactNode;
  /** Centraliza título e texto (usado na conquista). */
  centerText?: boolean;
};

const OFFSCREEN = Dimensions.get('window').height;
/** No modo "center" a caixa só desliza um pouco, junto com o fade. */
const CENTER_OFFSET = 24;

/**
 * Sheet/Confirm: alça no topo, raio 28 só em cima, fundo escurecido (scrim).
 * Com placement="center" vira uma caixa no meio da tela, com todos os cantos arredondados.
 * Tocar fora ou no "voltar" do Android fecha.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
  placement = 'bottom',
  icon,
  centerText,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const centered = placement === 'center';
  const start = centered ? CENTER_OFFSET : OFFSCREEN;

  // Animação feita "à mão" (e não com entering), porque animações de entrada
  // dentro de <Modal> não rodam de forma confiável no iOS.
  const translateY = useSharedValue(start);
  useEffect(() => {
    if (!visible) {
      translateY.set(start);
      return;
    }
    translateY.set(reduceMotion ? 0 : withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }));
  }, [visible, reduceMotion, translateY, start]);
  const slide = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.root, centered && styles.rootCenter]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={centered}
      >
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t.common.close}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[
            centered ? styles.box : styles.sheet,
            shadowElevated,
            {
              backgroundColor: colors.surface,
              paddingBottom: centered ? space[5] : Math.max(insets.bottom, space[5]) + space[3],
            },
            slide,
          ]}
        >
          {!centered && (
            <View style={[styles.handle, { backgroundColor: colors.border }]} accessibilityLabel={t.sheet.handle} />
          )}
          <ScrollView bounces={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {icon}
            {!!title && (
              <Text accessibilityRole="header" style={[styles.title, centerText && styles.centerText]}>
                {title}
              </Text>
            )}
            {!!description && (
              <Text color="textSecondary" style={centerText && styles.centerText}>
                {description}
              </Text>
            )}
            {children && <View style={styles.actions}>{children}</View>}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  rootCenter: { justifyContent: 'center', paddingHorizontal: screenPadding },
  box: {
    borderRadius: radius.sheetTop,
    paddingTop: space[2],
    paddingHorizontal: screenPadding,
    maxHeight: '80%',
  },
  sheet: {
    borderTopLeftRadius: radius.sheetTop,
    borderTopRightRadius: radius.sheetTop,
    paddingTop: space[3],
    paddingHorizontal: screenPadding,
    maxHeight: '90%',
  },
  handle: { width: 40, height: 4, borderRadius: radius.chip, alignSelf: 'center' },
  content: { gap: space[3], paddingTop: space[4] },
  title: { fontFamily: fonts.heading700, fontSize: 20, lineHeight: 26 },
  centerText: { textAlign: 'center' },
  actions: { gap: space[1], marginTop: space[2] },
});
