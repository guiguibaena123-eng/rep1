import * as SystemUI from 'expo-system-ui';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { usePreferences } from '@/features/preferences/store';

import { darkColors, lightColors, type ColorTokens } from './tokens';

type Theme = { colors: ColorTokens; isDark: boolean };

const ThemeContext = createContext<Theme>({ colors: lightColors, isDark: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const mode = usePreferences((s) => s.themeMode);
  const isDark = mode === 'dark' || (mode === 'auto' && system === 'dark');
  const colors = isDark ? darkColors : lightColors;

  // Cor de fundo da janela nativa (aparece por trás das telas durante transições).
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  return <ThemeContext.Provider value={{ colors, isDark }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
