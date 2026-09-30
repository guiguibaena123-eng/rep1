import { Stack } from 'expo-router/stack';

import { useTheme } from '@/theme/ThemeProvider';

/** Meu perfil (T18) e Editar perfil (T19): abrem por cima das abas, sem a barra inferior. */
export default function MyProfileLayout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      {/* Sem o gesto de voltar do iOS: sair da edição passa pelo "Sair sem salvar?". */}
      <Stack.Screen name="editar" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
