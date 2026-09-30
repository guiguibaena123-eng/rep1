import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { CircleAlert, Crown, SearchX } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, EmptyState, Screen, ScreenHeader, Text, useToast } from '@/components';
import { useAuth } from '@/features/auth/AuthProvider';
import { useContactSupport } from '@/features/plan/contact';
import { formatDateBR, subscriptionView } from '@/features/plan/logic';
import { checkSubscription, mySubscriptionKey, openCheckout, useSubscription } from '@/features/plan/subscription';
import { useProfile } from '@/features/profile/api';
import { isPremium } from '@/features/profile/types';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

const pay = t.payment;
/** Espera antes do plano B (o aviso automático da Stripe costuma chegar antes disso). */
const AUTO_CHECK_MS = 5000;
/** Enquanto confirma, o plano também é recarregado a cada 4 segundos. */
const PROFILE_POLL_MS = 4000;

/** Acompanha a assinatura depois de voltar da página de pagamento (params subscription_id e url). */
export default function SubscriptionReturnScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { subscription_id: id, url } = useLocalSearchParams<{ subscription_id?: string; url?: string }>();
  const profile = useProfile();
  const premium = isPremium(profile.data);
  const sub = useSubscription(id, premium);
  const [checking, setChecking] = useState(false);

  const row = sub.data;
  const view = row ? subscriptionView(row.status, premium) : null;
  const active = view === 'active';

  // O Premium entra por uma cobrança aprovada (no servidor): enquanto confirma, recarrega o plano.
  const refetchProfile = profile.refetch;
  const refetchSub = sub.refetch;
  useEffect(() => {
    if (view !== 'checking') return;
    const timer = setInterval(() => refetchProfile(), PROFILE_POLL_MS);
    return () => clearInterval(timer);
  }, [view, refetchProfile]);

  // Ativa: atualiza o Perfil (mostra "renova em…").
  useEffect(() => {
    if (active) queryClient.invalidateQueries({ queryKey: mySubscriptionKey(session?.user.id) });
  }, [active, queryClient, session?.user.id]);

  const runCheck = async (manual: boolean) => {
    if (!id) return;
    setChecking(true);
    try {
      await checkSubscription(id);
      await Promise.all([refetchSub(), refetchProfile()]);
    } catch {
      if (manual) toast.show(t.errors.INTERNAL, 'error');
    } finally {
      setChecking(false);
    }
  };

  // Plano B automático, 1 vez: se o aviso da Stripe ainda não chegou, pergunta ao servidor.
  const autoChecked = useRef(false);
  useEffect(() => {
    if (!id || active || autoChecked.current) return;
    const timer = setTimeout(() => {
      autoChecked.current = true;
      checkSubscription(id)
        .then(() => Promise.all([refetchSub(), refetchProfile()]))
        .catch(() => {});
    }, AUTO_CHECK_MS);
    return () => clearTimeout(timer);
  }, [id, active, refetchSub, refetchProfile]);

  const home = () => router.dismissTo('/');
  const contactSupport = useContactSupport();
  const help = () => contactSupport('assinatura');

  let body;
  if (sub.isPending && !!id) {
    body = <ActivityIndicator color={colors.primary} style={{ marginTop: space[8] }} />;
  } else if (!row) {
    body = <EmptyState icon={SearchX} title={pay.notFound} actionLabel={pay.closeLater} onAction={home} />;
  } else if (view === 'active') {
    const next = row.next_payment_date ? formatDateBR(row.next_payment_date) : null;
    body = <EmptyState icon={Crown} title={pay.approvedTitle} text={pay.approvedText(next)} actionLabel={pay.approvedCta} onAction={home} />;
  } else if (view === 'failed') {
    body = (
      <View style={{ gap: space[3] }}>
        <EmptyState
          icon={CircleAlert}
          title={pay.failedTitle}
          text={pay.failedText}
          actionLabel={pay.tryAgain}
          onAction={() => router.replace('/premium/pagamento')}
        />
        <Button label={pay.help} variant="text" onPress={help} />
      </View>
    );
  } else {
    body = (
      <View style={styles.checking} accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.primary} size="large" />
        <Text variant="screenTitle" align="center" accessibilityRole="header">
          {pay.checkingTitle}
        </Text>
        <Text color="textSecondary" align="center">
          {pay.checkingText}
        </Text>
        <View style={styles.actions}>
          <Button label={pay.checkNow} onPress={() => runCheck(true)} loading={checking} />
          {!!url && <Button label={pay.backToPay} variant="secondary" onPress={() => openCheckout(url).catch(() => {})} />}
          <Button label={pay.closeLater} variant="text" onPress={home} />
        </View>
        <Text variant="caption" color="textSecondary" align="center">
          {pay.laterHint}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader leading="close" onLeadingPress={home} />
      <Screen withHeader>{body}</Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  checking: { alignItems: 'center', gap: space[4], paddingTop: space[6] },
  actions: { alignSelf: 'stretch', gap: space[2], marginTop: space[2] },
});
