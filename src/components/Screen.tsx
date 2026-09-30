import type { ReactElement, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { screenPadding, space } from '@/theme/tokens';

import { useIntroFlight } from './introFlight';
import { BagLogo } from './Logo';

/** Distância do topo da tela até o logo das abas. A abertura usa a mesma conta para pousar o logo. */
export function brandLogoTop(insetTop: number) {
  return Math.max(insetTop, 24) + space[3];
}

/**
 * Maleta do canto das abas: azul no tema claro, branca no escuro.
 * Fica invisível enquanto o logo da abertura ainda está voando até aqui.
 */
export function BrandLogo() {
  const { isDark } = useTheme();
  const flying = useIntroFlight((s) => s.flying);
  return (
    <View style={[styles.brand, flying && styles.hidden]}>
      <BagLogo tone={isDark ? 'white' : 'brand'} />
    </View>
  );
}

export type ScreenProps = {
  children: ReactNode;
  /** Rola o conteúdo (padrão). Desligue em telas de altura fixa (ex.: T7). */
  scroll?: boolean;
  /** Rodapé fixo (ex.: botão primário das telas de fluxo). */
  footer?: ReactNode;
  /** Espaço vertical entre os blocos da tela. Padrão 16 (Início) — telas de formulário usam 24–32. */
  gap?: number;
  /** Retira o recuo do topo quando a tela já tem um ScreenHeader. */
  withHeader?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Maleta do Siwki no canto superior esquerdo (telas de aba). */
  brand?: boolean;
};

/**
 * Moldura padrão das telas: fundo do tema, margem lateral de 20px e área segura.
 * O topo segue o design (64px do topo em telas de aba, contando a barra de status).
 */
export function Screen({
  children,
  scroll = true,
  footer,
  gap = space[4],
  withHeader,
  refreshControl,
  contentStyle,
  brand,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  // Com a marca, o topo fica mais curto: o nome ocupa o espaço que antes era só respiro.
  const top = withHeader ? space[4] : brand ? brandLogoTop(insets.top) : Math.max(insets.top, 24) + space[5];

  const body = [styles.content, { gap, paddingTop: top }, contentStyle];
  const content = brand ? (
    <>
      <BrandLogo />
      {children}
    </>
  ) : (
    children
  );

  return (
    // No iOS o teclado cobre a tela: o KeyboardAvoidingView empurra o rodapé para cima.
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={[body, styles.grow]}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={[body, styles.fill]}>{content}</View>
      )}
      {footer && (
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, space[5]) + space[3] },
          ]}
        >
          {footer}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grow: { flexGrow: 1 },
  fill: { flex: 1 },
  brand: { alignSelf: 'flex-start', paddingBottom: space[1] },
  hidden: { opacity: 0 },
  content: { paddingHorizontal: screenPadding, paddingBottom: space[8] },
  footer: { paddingHorizontal: screenPadding, paddingTop: space[4], gap: space[1] },
});
