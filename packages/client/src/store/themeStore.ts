import { create } from 'zustand';

interface ThemeState {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  isDark: boolean;
  setColors: (colors: Partial<ThemeState>) => void;
  resetColors: () => void;
}

const defaultColors = {
  primaryColor: '#7c3aed',
  secondaryColor: '#4f46e5',
  accentColor: '#a78bfa',
  backgroundColor: '#0f0a1a',
  surfaceColor: '#1a122e',
};

export const useThemeStore = create<ThemeState>()((set) => ({
  ...defaultColors,
  isDark: true,

  setColors: (colors) =>
    set((state) => ({ ...state, ...colors })),

  resetColors: () =>
    set({ ...defaultColors }),
}));
