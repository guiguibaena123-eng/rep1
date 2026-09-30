import { useState } from 'react';

import { BottomSheet, Button, Input } from '@/components';
import { t } from '@/i18n';

import { sendPasswordReset } from './api';
import { emailSchema } from './validation';

type Props = { visible: boolean; onClose: () => void; initialEmail?: string };

/**
 * "Esqueci minha senha": envia um link por e-mail. O link abre o app na tela "Crie uma senha nova".
 * A resposta é sempre genérica, para não revelar se o e-mail tem conta.
 */
export function ForgotPasswordSheet({ visible, onClose, initialEmail = '' }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const close = () => {
    setSent(false);
    setEmailError(null);
    onClose();
  };

  const send = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setEmailError(t.auth.emailInvalid);
      return;
    }
    setSending(true);
    await sendPasswordReset(parsed.data);
    setSending(false);
    setSent(true);
  };

  return (
    <BottomSheet placement="center" visible={visible} onClose={close} title={t.forgot.title} description={sent ? t.forgot.sent : t.forgot.text}>
      {sent ? (
        <Button label={t.forgot.ok} onPress={close} />
      ) : (
        <>
          <Input
            label={t.auth.email}
            placeholder={t.auth.emailPlaceholder}
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setEmailError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            error={emailError}
          />
          <Button label={t.forgot.send} onPress={send} loading={sending} style={{ marginTop: 8 }} />
        </>
      )}
    </BottomSheet>
  );
}
