import { Stack } from 'expo-router/stack';

import { usePreferences } from '@/features/preferences/store';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Telas sem login. As boas-vindas (T2) só aparecem na primeira vez:
 * ao tocar "Pular" ou "Começar", a tela fica bloqueada e o app vai sozinho para T3.
 */
export default function AuthLayout() {
  const { colors } = useTheme();
  const seenWelcome = usePreferences((s) => s.seenWelcome);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={!seenWelcome}>
        <Stack.Screen name="bem-vindo" />
      </Stack.Protected>
      <Stack.Screen name="conta" />
      <Stack.Screen name="confirmar-email" />
    </Stack>
  );
}
