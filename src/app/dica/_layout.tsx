import { Stack } from 'expo-router/stack';

import { useTheme } from '@/theme/ThemeProvider';

/** Leitura de dica (T14): abre por cima das abas, sem a barra inferior. */
export default function TipLayout() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
