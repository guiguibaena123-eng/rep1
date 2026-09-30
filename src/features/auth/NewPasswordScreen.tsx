import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, Input, Screen, Text, useToast } from '@/components';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke } from '@/theme/tokens';

import { updatePassword } from './api';
import { useAuthLinkState } from './deepLink';
import { newPasswordSchema, type NewPasswordForm } from './validation';

/** Aberta pelo link "criar senha nova" do e-mail. A pessoa já está logada pelo link. */
export function NewPasswordScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const setActive = useAuthLinkState((s) => s.setActive);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    mode: 'onTouched',
    defaultValues: { password: '' },
  });

  const save = form.handleSubmit(async ({ password }) => {
    setError(null);
    const result = await updatePassword(password);
    if (!result.ok) return setError(result.message);
    toast.show(t.newPassword.done);
    setActive(false); // volta para o fluxo normal (T4 ou abas)
  });

  return (
    <Screen
      gap={20}
      footer={<Button label={t.newPassword.save} onPress={save} loading={form.formState.isSubmitting} />}
    >
      <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
        <KeyRound size={30} color={colors.primary} strokeWidth={iconStroke} />
      </View>
      <Text variant="screenTitle" accessibilityRole="header">
        {t.newPassword.title}
      </Text>
      <Text color="textSecondary">{t.newPassword.text}</Text>
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <Input
            label={t.newPassword.label}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            password
            autoComplete="new-password"
            textContentType="newPassword"
            error={fieldState.error?.message ?? error}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: { width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
