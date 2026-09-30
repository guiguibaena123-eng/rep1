import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, size } from '@/theme/tokens';

import { useUnreadCount } from './api';

/** Sino do canto da Início: abre as notificações e mostra quantas ainda não foram lidas (+ lembretes de hoje). */
export function NotificationBell({ extra = 0 }: { extra?: number }) {
  const { colors } = useTheme();
  const unread = (useUnreadCount().data ?? 0) + extra;
  return (
    <Pressable
      onPress={() => router.push('/notificacoes')}
      accessibilityRole="button"
      accessibilityLabel={t.notifications.bellA11y(unread)}
      style={({ pressed }) => [
        styles.bell,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Bell size={22} color={colors.text} strokeWidth={iconStroke} />
      {unread > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.badgeText, { color: colors.onPrimary }]}>{unread > 9 ? '9+' : String(unread)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bell: {
    width: size.minTouch,
    height: size.minTouch,
    borderRadius: radius.chip,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fonts.body400,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
});
