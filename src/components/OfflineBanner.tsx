import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, radius, shadowElevated, size, space } from '@/theme/tokens';

import { Text } from './Text';

/**
 * Faixa "Você está sem conexão" (E02), flutuando acima da barra de abas.
 * Não bloqueia toques (pointerEvents none): dá para continuar lendo o que já carregou.
 * As ações que precisam de internet já explicam o erro (mensagem NETWORK) se forem tocadas.
 */
export function OfflineBanner() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const net = useNetInfo();
  // null = ainda não sabemos; só mostra com certeza de que está sem conexão.
  const offline = net.isConnected === false || net.isInternetReachable === false;
  if (!offline) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { bottom: insets.bottom + size.navBarHeight + space[2] }]}
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.pill, shadowElevated, { backgroundColor: colors.warningSoft }]} accessible accessibilityRole="alert">
        <WifiOff size={18} color={colors.warningInk} strokeWidth={iconStroke} />
        <Text variant="bodySmall" weight="semibold" style={{ color: colors.warningInk, flexShrink: 1 }}>
          {t.network.offline}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space[5], right: space[5], alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: 10,
    paddingHorizontal: space[4],
    borderRadius: radius.button,
  },
});
