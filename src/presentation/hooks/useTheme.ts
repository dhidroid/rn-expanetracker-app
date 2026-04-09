import { useMemo } from 'react';
import { colors, darkColors, ThemeColors } from '../../core/theme';
import { useThemeStore } from './useThemeStore';

export const useTheme = (): ThemeColors => {
  const isDark = useThemeStore(state => state.isDark);
  return useMemo(() => (isDark ? darkColors : colors), [isDark]);
};

export const useIsDarkMode = () => useThemeStore(state => state.isDark);
export const useToggleTheme = () => useThemeStore(state => state.toggleTheme);
export const useSetDarkMode = () => useThemeStore(state => state.setDarkMode);
