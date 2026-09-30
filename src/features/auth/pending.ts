import { create } from 'zustand';

/**
 * Cadastro aguardando confirmação de e-mail. Fica SÓ na memória (nunca salvo no aparelho):
 * serve para o botão "Já confirmei" tentar entrar sem pedir a senha de novo.
 */
type PendingSignup = {
  email: string;
  password: string;
  set: (email: string, password: string) => void;
  clear: () => void;
};

export const usePendingSignup = create<PendingSignup>((set) => ({
  email: '',
  password: '',
  set: (email, password) => set({ email, password }),
  clear: () => set({ email: '', password: '' }),
}));
