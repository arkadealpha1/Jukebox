import { create } from 'zustand';

interface ThemeState {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  isDark: boolean;
  setColors: (colors: Partial<Omit<ThemeState, 'setColors' | 'resetColors' | 'toggleTheme'>>) => void;
  resetColors: () => void;
  toggleTheme: () => void;
}

const defaultColors = {
  primaryColor: '#d6a84f',
  secondaryColor: '#b11226',
  accentColor: '#00e5ff',
  backgroundColor: '#050406',
  surfaceColor: '#0d0a0b',
};

export const useThemeStore = create<ThemeState>()((set, get) => ({
  ...defaultColors,
  isDark: true,

  setColors: (colors) => set((state) => ({ ...state, ...colors })),

  resetColors: () =>
    set((state) => ({
      ...defaultColors,
      isDark: state.isDark,
    })),

  toggleTheme: () => {
    const next = !get().isDark;
    document.documentElement.classList.toggle('light', !next);
    document.documentElement.classList.toggle('dark', next);
    set({ isDark: next });
  },
}));