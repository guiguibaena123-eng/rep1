import { ChevronLeft, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, size, space } from '@/theme/tokens';

import { Text } from './Text';

export type ScreenHeaderProps = {
  title?: string;
  /** 'back' = seta (Header/Back); 'close' = X (telas de fluxo, abertas por cima). */
  leading?: 'back' | 'close' | 'none';
  onLeadingPress?: () => void;
  /** Ação opcional à direita (ex.: favoritar). */
  trailing?: ReactNode;
  /** Conteúdo entre o botão e a direita (ex.: barra de progresso da T4/T7). */
  children?: ReactNode;
};

/** Header/Back e Header/Title: título, ação opcional à direita, voltar/fechar à esquerda. */
export function ScreenHeader({ title, leading = 'back', onLeadingPress, trailing, children }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const Icon = leading === 'close' ? X : ChevronLeft;

  return (
    <View style={[styles.bar, { paddingTop: Math.max(insets.top, 24) + 4, backgroundColor: colors.background }]}>
      {leading !== 'none' && (
        <Pressable
          onPress={onLeadingPress}
          accessibilityRole="button"
          accessibilityLabel={leading === 'close' ? t.common.close : t.common.back}
          style={styles.iconButton}
        >
          <Icon size={24} color={colors.text} strokeWidth={iconStroke} />
        </Pressable>
      )}
      <View style={styles.middle}>
        {children ??
          (title ? (
            <Text weight="semibold" accessibilityRole="header" numberOfLines={1}>
              {title}
            </Text>
          ) : null)}
      </View>
      {trailing && <View style={styles.trailing}>{trailing}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingLeft: space[2], paddingRight: space[5] },
  iconButton: { width: size.minTouch, height: size.minTouch, alignItems: 'center', justifyContent: 'center' },
  middle: { flex: 1 },
  trailing: { marginRight: -space[3] },
});
