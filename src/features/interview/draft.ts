import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Rascunho da simulação em andamento, salvo no aparelho.
 * Se o app fechar no meio, a pessoa volta para a mesma pergunta com o texto que já tinha escrito.
 */
export type Draft = {
  /** Pergunta atual (as anteriores já foram enviadas e ficam travadas). */
  index: number;
  /** Já passou da tela "Respire fundo". */
  started: boolean;
  answers: Record<string, string>;
};

type DraftState = {
  drafts: Record<string, Draft>;
  hydrated: boolean;
  save: (sessionId: string, draft: Draft) => void;
  clear: (sessionId: string) => void;
};

export const EMPTY_DRAFT: Draft = { index: 0, started: false, answers: {} };

export const useDrafts = create<DraftState>()(
  persist(
    (set) => ({
      drafts: {},
      hydrated: false,
      save: (sessionId, draft) => set((s) => ({ drafts: { ...s.drafts, [sessionId]: draft } })),
      clear: (sessionId) =>
        set((s) => {
          const { [sessionId]: _removed, ...rest } = s.drafts;
          return { drafts: rest };
        }),
    }),
    {
      name: 'pronto-interview-drafts',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ drafts }) => ({ drafts }),
      onRehydrateStorage: () => () => useDrafts.setState({ hydrated: true }),
    },
  ),
);
