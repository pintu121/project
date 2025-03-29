import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'theme-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migration from version 0 to version 1
        if (version === 0) {
          return {
            theme: typeof persistedState.theme === 'string' 
              ? persistedState.theme 
              : 'light'
          };
        }
        return persistedState;
      }
    }
  )
);