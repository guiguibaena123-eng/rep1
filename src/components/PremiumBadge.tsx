import { Lock } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

import { Text } from './Text';

/** Badge/Premium: pílula âmbar pequena com cadeado, para funções bloqueadas. */
export function PremiumBadge() {
  const { colors } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: colors.warning }]} accessibilityLabel={t.common.premium}>
      <Lock size={12} color={colors.onWarning} strokeWidth={2.25} />
      <Text variant="caption" weight="semibold" style={{ color: colors.onWarning }}>
        {t.common.premium}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    minHeight: 24,
    paddingHorizontal: 10,
    borderRadius: radius.chip,
  },
});
