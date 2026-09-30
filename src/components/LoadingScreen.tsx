import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

/** Tela vazia com um indicador de carregamento (usada enquanto uma tela de fluxo busca os dados). */
export function LoadingScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} accessibilityLabel={t.common.loading}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
