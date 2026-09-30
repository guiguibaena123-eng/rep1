import { Stack } from 'expo-router/stack';

import { useTheme } from '@/theme/ThemeProvider';

/** Seguidores e Seguindo: abre por cima das abas, sem a barra inferior. */
export default function ConnectionsLayout() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
