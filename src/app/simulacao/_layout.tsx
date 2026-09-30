import { Stack } from 'expo-router/stack';

import { useTheme } from '@/theme/ThemeProvider';

/**
 * Fluxo da simulação (T7, T8, T9): abre por cima das abas, sem a barra inferior.
 * O gesto de voltar fica desligado: sair da simulação passa pela confirmação "Sair da simulação?".
 */
export default function SimulationLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{ headerShown: false, gestureEnabled: false, contentStyle: { backgroundColor: colors.background } }}
    />
  );
}
