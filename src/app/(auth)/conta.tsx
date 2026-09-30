import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, Checkbox, Input, Screen, Text } from '@/components';
import { LogoMark } from '@/components/Logo';
import { SegmentTabs } from '@/components/SegmentTabs';
import { signIn, signInWithGoogle, signUp } from '@/features/auth/api';
import { secondsLeft, useLoginAttempts } from '@/features/auth/attempts';
import { ForgotPasswordSheet } from '@/features/auth/ForgotPasswordSheet';
import { GoogleLogo } from '@/features/auth/GoogleLogo';
import { usePendingSignup } from '@/features/auth/pending';
import { signInSchema, signUpSchema } from '@/features/auth/validation';
import { APP_NAME, t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/tokens';

type Tab = 'signup' | 'signin';
type FormValues = { email: string; password: string; accepted: boolean };

/** T3 Criar conta / Entrar (design/telas/T03Conta.dc.html). */
export default function AccountScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('signup');
  const [formError, setFormError] = useState<string | null>(null);
  const [suggestSignIn, setSuggestSignIn] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const setPending = usePendingSignup((s) => s.set);
  const { lockedUntil, registerFailure, reset: resetAttempts } = useLoginAttempts();
  const [now, setNow] = useState(() => Date.now());

  const isSignUp = tab === 'signup';
  const lockSeconds = isSignUp ? 0 : secondsLeft(lockedUntil, now);

  // Conta os segundos do bloqueio de tentativas.
  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const form = useForm<FormValues>({
    // Valida ao sair do campo e, depois disso, a cada letra.
    mode: 'onTouched',
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema) as unknown as Resolver<FormValues>,
    defaultValues: { email: '', password: '', accepted: false },
  });
  const accepted = useWatch({ control: form.control, name: 'accepted' });

  const switchTab = (next: Tab) => {
    setTab(next);
    setFormError(null);
    setSuggestSignIn(false);
    form.clearErrors();
  };

  // Google: serve para criar conta e para entrar. A sessão nova troca a tela sozinha.
  const continueWithGoogle = async () => {
    setFormError(null);
    setSuggestSignIn(false);
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.ok && result.reason !== 'cancelled') setFormError(result.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const submit = form.handleSubmit(async ({ email, password }) => {
    setFormError(null);
    setSuggestSignIn(false);

    if (isSignUp) {
      const result = await signUp(email, password);
      if (result.ok) {
        setPending(email.trim(), password);
        router.push('/confirmar-email');
      } else {
        setFormError(result.message);
        setSuggestSignIn(result.reason === 'already_registered');
      }
      return;
    }

    const result = await signIn(email, password);
    if (result.ok) {
      resetAttempts(); // a sessão nova troca a tela sozinha
      return;
    }
    if (result.reason === 'not_confirmed') {
      setPending(email.trim(), password);
      router.push('/confirmar-email');
      return;
    }
    if (result.reason === 'credentials') registerFailure();
    setFormError(result.message);
  });

  return (
    <Screen
      gap={24}
      footer={
        <>
          {lockSeconds > 0 && (
            <Text variant="bodySmall" color="textSecondary" align="center">
              {t.auth.waitSeconds(lockSeconds)}
            </Text>
          )}
          <Button
            label={isSignUp ? t.auth.submitSignUp : t.auth.submitSignIn}
            onPress={submit}
            loading={form.formState.isSubmitting}
            disabled={(isSignUp && !accepted) || lockSeconds > 0 || googleLoading}
          />
          <Button label={t.auth.forgot} variant="text" onPress={() => setForgotOpen(true)} />
        </>
      }
    >
      <View style={styles.brand}>
        <LogoMark size={36} tone="primary" />
        <Text style={styles.brandName}>{APP_NAME}</Text>
      </View>

      <Text variant="screenTitle" accessibilityRole="header">
        {isSignUp ? t.auth.headingSignUp : t.auth.headingSignIn}
      </Text>

      <SegmentTabs
        options={[
          { value: 'signup', label: t.auth.tabSignUp },
          { value: 'signin', label: t.auth.tabSignIn },
        ]}
        value={tab}
        onChange={switchTab}
      />

      <View style={styles.google}>
        <Button
          label={t.auth.google}
          variant="secondary"
          icon={<GoogleLogo />}
          onPress={continueWithGoogle}
          loading={googleLoading}
          disabled={form.formState.isSubmitting}
        />
        <Text variant="caption" color="textSecondary" align="center">
          {t.auth.googleTermsPrefix}
          <Text variant="caption" weight="semibold" color="primary" onPress={() => router.push('/legal/termos')}>
            {t.auth.terms}
          </Text>
          {t.auth.termsAnd}
          <Text variant="caption" weight="semibold" color="primary" onPress={() => router.push('/legal/privacidade')}>
            {t.auth.privacy}
          </Text>
        </Text>
      </View>

      <View style={styles.divider} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <Text variant="caption" color="textSecondary">
          {t.auth.orEmail}
        </Text>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>

      <View style={styles.fields}>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              label={t.auth.email}
              placeholder={t.auth.emailPlaceholder}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Input
              label={t.auth.password}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              password
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              textContentType={isSignUp ? 'newPassword' : 'password'}
              error={fieldState.error?.message}
            />
          )}
        />

        {isSignUp && (
          <Controller
            control={form.control}
            name="accepted"
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={field.onChange}
                accessibilityLabel={`${t.auth.termsPrefix}${t.auth.terms}${t.auth.termsAnd}${t.auth.privacy}`}
              >
                <Text variant="bodySmall" color="textSecondary">
                  {t.auth.termsPrefix}
                  <Text variant="bodySmall" weight="semibold" color="primary" onPress={() => router.push('/legal/termos')}>
                    {t.auth.terms}
                  </Text>
                  {t.auth.termsAnd}
                  <Text
                    variant="bodySmall"
                    weight="semibold"
                    color="primary"
                    onPress={() => router.push('/legal/privacidade')}
                  >
                    {t.auth.privacy}
                  </Text>
                </Text>
              </Checkbox>
            )}
          />
        )}

        {formError && (
          <View style={[styles.formError, { backgroundColor: colors.errorSoft }]} accessibilityLiveRegion="polite">
            <Text variant="bodySmall" weight="medium" style={{ color: colors.toastErrorText }}>
              {formError}
            </Text>
            {suggestSignIn && (
              <Button label={t.auth.goToSignIn} variant="text" onPress={() => switchTab('signin')} style={styles.inlineAction} />
            )}
          </View>
        )}
      </View>

      <ForgotPasswordSheet
        visible={forgotOpen}
        onClose={() => setForgotOpen(false)}
        initialEmail={form.getValues('email')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandName: { fontFamily: fonts.heading800, fontSize: 20, lineHeight: 26 },
  fields: { gap: 18 },
  google: { gap: 10 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  formError: { padding: 14, borderRadius: radius.button, gap: 4 },
  inlineAction: { alignSelf: 'flex-start', marginLeft: -16 },
});
