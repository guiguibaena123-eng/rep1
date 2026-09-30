import { Stack } from 'expo-router/stack';

import { useTheme } from '@/theme/ThemeProvider';

/** Análise do LinkedIn (T11 e T12): abre por cima das abas, sem a barra inferior. */
export default function AnalysisLayout() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
