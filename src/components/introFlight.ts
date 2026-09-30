import { create } from 'zustand';

type IntroFlight = {
  /**
   * true enquanto o logo da abertura ainda não pousou no canto das abas.
   * Nesse tempo o logo do Screen (`brand`) fica invisível, para não aparecerem dois.
   * Começa true: a Início pode montar embaixo da abertura antes do voo terminar.
   */
  flying: boolean;
  land: () => void;
};

export const useIntroFlight = create<IntroFlight>((set) => ({
  flying: true,
  land: () => set({ flying: false }),
}));
