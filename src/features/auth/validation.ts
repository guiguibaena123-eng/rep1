import { z } from 'zod';

import { t } from '@/i18n';

export const MIN_PASSWORD = 8;

// Mesma regra do design (T03Conta.dc.html).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// As mensagens são funções: o texto sai no idioma atual na hora do erro, não quando o app abre.
export const emailSchema = z.string().trim().regex(EMAIL_RE, { error: () => t.auth.emailInvalid });

// Senha nova: 8+ caracteres, com letra E número (mesma regra do Supabase: "letters_digits").
const newPasswordField = z
  .string()
  .min(MIN_PASSWORD, { error: () => t.auth.passwordShort })
  .regex(/[A-Za-z]/, { error: () => t.auth.passwordWeak })
  .regex(/[0-9]/, { error: () => t.auth.passwordWeak });

export const signUpSchema = z.object({
  email: emailSchema,
  password: newPasswordField,
  accepted: z.literal(true, { error: () => t.auth.termsRequired }),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: () => t.auth.passwordEmpty }),
});

export const newPasswordSchema = z.object({
  password: newPasswordField,
});

export type SignUpForm = z.infer<typeof signUpSchema>;
export type SignInForm = z.infer<typeof signInSchema>;
export type NewPasswordForm = z.infer<typeof newPasswordSchema>;
