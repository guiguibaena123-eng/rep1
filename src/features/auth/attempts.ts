import { create } from 'zustand';

export const MAX_ATTEMPTS = 5;
export const LOCK_MS = 60_000;

type AttemptsState = {
  failures: number;
  lockedUntil: number | null;
  registerFailure: () => void;
  reset: () => void;
};

/**
 * Controle local de tentativas de login (o Supabase também tem limite próprio no servidor).
 * Depois de 5 erros seguidos, bloqueia por 1 minuto.
 */
export const useLoginAttempts = create<AttemptsState>((set, get) => ({
  failures: 0,
  lockedUntil: null,
  registerFailure: () => {
    const failures = get().failures + 1;
    if (failures >= MAX_ATTEMPTS) set({ failures: 0, lockedUntil: Date.now() + LOCK_MS });
    else set({ failures });
  },
  reset: () => set({ failures: 0, lockedUntil: null }),
}));

/** Segundos restantes de bloqueio (0 = liberado). */
export function secondsLeft(lockedUntil: number | null, now = Date.now()) {
  if (!lockedUntil) return 0;
  return Math.max(0, Math.ceil((lockedUntil - now) / 1000));
}
