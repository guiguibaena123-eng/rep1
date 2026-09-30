import { Stack } from 'expo-router/stack';

import { useTheme } from '@/theme/ThemeProvider';

/** Premium (T16) e Como ativar (T17): abrem por cima das abas, como um fluxo. */
export default function PremiumLayout() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
