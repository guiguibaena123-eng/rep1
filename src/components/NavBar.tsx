import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Compass, FileUser, House, MessageCircle, User, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke } from '@/theme/tokens';

import { Text } from './Text';

/** Ordem e ícones das 5 abas (Prompt 1, seção 6). A chave é o nome do arquivo em src/app/(tabs). */
// Guarda a CHAVE do texto (não o texto): o rótulo é lido na hora, no idioma atual.
const TABS: Record<string, { label: keyof typeof t.tabs; icon: LucideIcon }> = {
  index: { label: 'home', icon: House },
  treinar: { label: 'train', icon: MessageCircle },
  explorar: { label: 'explore', icon: Compass },
  linkedin: { label: 'linkedin', icon: FileUser },
  perfil: { label: 'profile', icon: User },
};

/**
 * Barra inferior (design/telas/NavBar.dc.html): 5 itens com ícone + rótulo,
 * item ativo em índigo com fundo suave.
 */
export function NavBar({ state, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  // No escuro o design usa o índigo claro (primaryInk) para o item ativo.
  const onColor = isDark ? colors.primaryInk : colors.primary;

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 18) },
      ]}
    >
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const Icon = tab.icon;
        const label = t.tabs[tab.label];
        const color = focused ? onColor : colors.textSecondary;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            style={[styles.item, { backgroundColor: focused ? colors.primarySoft : 'transparent' }]}
          >
            <Icon size={24} color={color} strokeWidth={iconStroke} />
            <Text variant="caption" weight={focused ? 'semibold' : 'medium'} style={{ color }} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
  },
  item: {
    flex: 1,
    maxWidth: 72,
    minHeight: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
});
