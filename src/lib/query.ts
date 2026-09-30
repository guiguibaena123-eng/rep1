import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    // Leituras: 1 nova tentativa automática em caso de falha de rede.
    queries: { retry: 1, staleTime: 30_000 },
    // Ações (inclusive as que consomem limite) NUNCA são repetidas sozinhas.
    mutations: { retry: 0 },
  },
});

// Quando o app volta para a tela, o TanStack Query recarrega os dados "velhos"
// (ex.: plano Premium liberado manualmente no painel).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (status) => focusManager.setFocused(status === 'active'));
}
