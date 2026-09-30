import { router } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, ScreenHeader, Text, useToast } from '@/components';
import { resendConfirmation, signIn } from '@/features/auth/api';
import { usePendingSignup } from '@/features/auth/pending';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, radius } from '@/theme/tokens';

const RESEND_WAIT_S = 60;

/**
 * Depois de criar a conta: pede para confirmar o e-mail.
 * "Reenviar e-mail" tem espera de 60s; "Já confirmei" tenta entrar com os dados digitados.
 */
export default function ConfirmEmailScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const { email, password, clear } = usePendingSignup();
  const [wait, setWait] = useState(RESEND_WAIT_S);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const back = () => {
    clear();
    if (router.canGoBack()) router.back();
    else router.replace('/conta');
  };

  const confirmed = async () => {
    setMessage(null);
    if (!email || !password) return back();
    setChecking(true);
    const result = await signIn(email, password);
    setChecking(false);
    // Sucesso: a sessão nova leva a pessoa para "Conhecendo você" sozinha.
    if (result.ok) clear();
    else setMessage(result.reason === 'not_confirmed' ? t.confirmEmail.notYet : result.message);
  };

  const resend = async () => {
    setResending(true);
    const result = await resendConfirmation(email);
    setResending(false);
    setWait(RESEND_WAIT_S);
    if (result.ok) toast.show(t.confirmEmail.resent);
    else setMessage(result.message);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader onLeadingPress={back} />
      <Screen
        withHeader
        gap={20}
        footer={
          <>
            <Button label={t.confirmEmail.confirmed} onPress={confirmed} loading={checking} />
            <Button
              label={wait > 0 ? t.confirmEmail.resendIn(wait) : t.confirmEmail.resend}
              variant="text"
              onPress={resend}
              disabled={wait > 0 || !email}
              loading={resending}
            />
          </>
        }
      >
        <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
          <MailCheck size={32} color={colors.primary} strokeWidth={iconStroke} />
        </View>
        <Text variant="screenTitle" accessibilityRole="header">
          {t.confirmEmail.title}
        </Text>
        <Text color="textSecondary">{t.confirmEmail.text(email)}</Text>
        <Text variant="bodySmall" color="textSecondary">
          {t.confirmEmail.hint}
        </Text>
        {!!message && (
          <View style={[styles.message, { backgroundColor: colors.warningSoft }]} accessibilityLiveRegion="polite">
            <Text variant="bodySmall" weight="medium" style={{ color: colors.warningInk }}>
              {message}
            </Text>
          </View>
        )}
        <Button label={t.confirmEmail.changeEmail} variant="text" onPress={back} style={styles.change} />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  message: { padding: 14, borderRadius: radius.button },
  change: { alignSelf: 'flex-start', marginLeft: -16 },
});
