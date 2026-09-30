import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { deviceLanguage, isLang, setLanguage as applyLanguage, type Lang } from '@/i18n';

export type ThemeMode = 'auto' | 'light' | 'dark';

/** null = seguir o idioma do celular. */
export type LanguageChoice = Lang | null;

/** Idioma que vale de fato: a escolha da pessoa ou, sem escolha, o do celular. */
export const effectiveLanguage = (choice: LanguageChoice): Lang => choice ?? deviceLanguage();

type PreferencesState = {
  themeMode: ThemeMode;
  /** Idioma escolhido em Configurações → Idioma (null = o do celular). */
  language: LanguageChoice;
  setLanguage: (language: LanguageChoice) => void;
  /** Já viu as boas-vindas (T2)? Depois da 1ª vez, o app abre direto em T3. */
  seenWelcome: boolean;
  /** true depois que o armazenamento local foi lido (evita decidir a rota cedo demais). */
  hydrated: boolean;
  /** Contas (ids) que já viram a conquista "Primeira simulação feita" neste aparelho. */
  celebratedFirst: string[];
  /** Conquistas de sequência já comemoradas: "userId:marco:início da sequência" (ex.: "abc:3:2026-09-28"). */
  celebratedStreaks: string[];
  /** Último plano visto por conta neste aparelho (true = Premium). Serve para avisar "Seu Premium está ativo". */
  premiumSeen: Record<string, boolean>;
  setThemeMode: (mode: ThemeMode) => void;
  setPremiumSeen: (userId: string, premium: boolean) => void;
  markWelcomeSeen: () => void;
  markCelebratedFirst: (userId: string) => void;
  markCelebratedStreaks: (keys: string[]) => void;
};

/** Preferências locais do aparelho. O tema também é salvo em profiles.theme. */
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      themeMode: 'auto',
      language: null,
      setLanguage: (language) => {
        applyLanguage(effectiveLanguage(language)); // troca o dicionário antes de as telas remontarem
        set({ language });
      },
      seenWelcome: false,
      hydrated: false,
      celebratedFirst: [],
      celebratedStreaks: [],
      premiumSeen: {},
      setThemeMode: (themeMode) => set({ themeMode }),
      setPremiumSeen: (userId, premium) => set((s) => ({ premiumSeen: { ...s.premiumSeen, [userId]: premium } })),
      markWelcomeSeen: () => set({ seenWelcome: true }),
      markCelebratedFirst: (userId) => set((s) => ({ celebratedFirst: [...s.celebratedFirst, userId] })),
      markCelebratedStreaks: (keys) =>
        set((s) => ({ celebratedStreaks: [...new Set([...s.celebratedStreaks, ...keys])] })),
    }),
    {
      name: 'pronto-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ themeMode, language, seenWelcome, celebratedFirst, celebratedStreaks, premiumSeen }) => ({
        themeMode,
        language,
        seenWelcome,
        celebratedFirst,
        celebratedStreaks,
        premiumSeen,
      }),
      onRehydrateStorage: () => (state) => {
        // O idioma salvo vale antes da primeira tela (a raiz espera `hydrated`).
        const saved = isLang(state?.language) ? state.language : null;
        applyLanguage(effectiveLanguage(saved));
        usePreferences.setState({ language: saved, hydrated: true });
      },
    },
  ),
);
