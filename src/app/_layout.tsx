import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Settings } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider, useToast } from '@/components';
import { BrandSplash } from '@/components/BrandSplash';
import { EmptyState } from '@/components/EmptyState';
import { ErrorScreen } from '@/components/ErrorScreen';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Screen } from '@/components/Screen';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { signOut } from '@/features/auth/api';
import { useAuthLinkState } from '@/features/auth/deepLink';
import { useEmailLanguageSync } from '@/features/auth/emailLanguage';
import { NewPasswordScreen } from '@/features/auth/NewPasswordScreen';
import { usePremiumActivatedNotice } from '@/features/plan/usePremiumNotice';
import { usePreferences } from '@/features/preferences/store';
import { useProfile, useProfileSync } from '@/features/profile/api';
import { useReminderSync } from '@/features/reminders/sync';
import { t } from '@/i18n';
import { isSupabaseConfigured } from '@/lib/env';
import { queryClient } from '@/lib/query';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    // Títulos das abas: arredondada, no espírito do traço do logo (escolha do usuário).
    Quicksand_700Bold,
  });

  // Troca a abertura nativa pela nossa T1 (mesmo fundo índigo) assim que as fontes carregam.
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // Se a fonte falhar (ex.: sem internet no Expo Go), seguimos com a fonte do sistema.
  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

/**
 * T1 Abertura: carrega sessão e perfil, e decide o destino.
 * - sem sessão → boas-vindas (só na 1ª vez) ou Criar conta/Entrar
 * - sessão com perfil incompleto → Conhecendo você (T4)
 * - sessão com perfil completo → abas
 * As telas protegidas trocam sozinhas quando a situação muda (entrar, sair, concluir T4).
 */
function RootNavigator() {
  const { colors, isDark } = useTheme();
  const { session, loading: authLoading } = useAuth();
  const hydrated = usePreferences((s) => s.hydrated);
  // Trocou o idioma? As telas remontam (key) e leem os textos do novo dicionário.
  const language = usePreferences((s) => s.language) ?? 'device';
  const setThemeMode = usePreferences((s) => s.setThemeMode);
  const profile = useProfile();
  const toast = useToast();
  const recoveryActive = useAuthLinkState((s) => s.active);
  const linkError = useAuthLinkState((s) => s.linkError);
  const setLinkError = useAuthLinkState((s) => s.setLinkError);

  // Link de e-mail vencido ou já usado: avisa com calma e segue no login.
  useEffect(() => {
    if (!linkError) return;
    toast.show(linkError === 'other_device' ? t.authLink.otherDevice : t.authLink.expired, 'error');
    setLinkError(null);
  }, [linkError, setLinkError, toast]);

  // Lembretes do aparelho iguais aos da conta; aviso quando o Premium for liberado no painel.
  useReminderSync(session ? profile.data : undefined);
  usePremiumActivatedNotice(session?.user.id, session ? profile.data : undefined);
  // Edição do perfil feita sem internet: envia quando a conexão voltar.
  useProfileSync();
  // E-mails da conta (senha nova etc.) no idioma do app.
  useEmailLanguageSync(session, language);

  const profileTheme = profile.data?.theme;
  useEffect(() => {
    if (profileTheme) setThemeMode(profileTheme);
  }, [profileTheme, setThemeMode]);

  const base = isDark ? DarkTheme : DefaultTheme;
  // Tema da navegação com as cores do Siwki (evita "piscar" branco entre telas).
  const navTheme = {
    ...base,
    colors: { ...base.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.border },
  };

  // A abertura espera o toque em "Vamos começar!" antes de seguir. Ela fica POR CIMA do app:
  // quando tudo carregou, a próxima tela monta embaixo e a abertura faz a animação de saída.
  const [introDone, setIntroDone] = useState(false);
  const [splashGone, setSplashGone] = useState(false);
  const ready = !authLoading && hydrated && !(!!session && profile.isPending);
  const showContent = !isSupabaseConfigured || (introDone && ready);
  const showSplash = isSupabaseConfigured && !splashGone;
  // Vai para as abas (Início)? Então o logo voa até o canto dela.
  const toHome = !!session && !recoveryActive && !profile.isError && !!profile.data?.onboarding_done;

  let content;
  if (!isSupabaseConfigured) {
    content = (
      <Screen>
        <EmptyState icon={Settings} title={t.config.title} text={t.config.text} />
      </Screen>
    );
  } else if (!showContent) {
    content = null;
  } else if (session && recoveryActive) {
    // Aberto pelo link "criar senha nova" do e-mail.
    content = <NewPasswordScreen />;
  } else if (session && profile.isError) {
    content = (
      <ErrorScreen
        onRetry={() => profile.refetch()}
        retrying={profile.isFetching}
        secondaryLabel={t.profile.signOut}
        onSecondary={() => signOut()}
      />
    );
  } else {
    const signedIn = !!session;
    const onboarded = !!profile.data?.onboarding_done;
    content = (
      <Stack key={language} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && !onboarded}>
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && onboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="simulacao" options={{ gestureEnabled: false }} />
          <Stack.Screen name="analise" />
          <Stack.Screen name="dica" />
          <Stack.Screen name="dicas" />
          <Stack.Screen name="pessoa" />
          <Stack.Screen name="meu-perfil" />
          <Stack.Screen name="configuracoes" />
          <Stack.Screen name="idioma" />
          {/* Tela comum (não modal): no iOS os avisos (toast) ficam atrás de telas modais. */}
          <Stack.Screen name="premium" />
          <Stack.Screen name="dev/componentes" />
        </Stack.Protected>
        <Stack.Screen name="legal/[doc]" options={{ presentation: 'modal' }} />
      </Stack>
    );
  }

  return (
    <NavigationThemeProvider value={navTheme}>
      {/* Na abertura (fundo índigo) a barra de status é sempre clara. */}
      <StatusBar style={showSplash || isDark ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {content}
        {!showSplash && <OfflineBanner />}
        {showSplash && (
          <BrandSplash
            started={introDone}
            ready={ready}
            toHome={toHome}
            onContinue={() => setIntroDone(true)}
            onExited={() => setSplashGone(true)}
          />
        )}
      </View>
    </NavigationThemeProvider>
  );
}
