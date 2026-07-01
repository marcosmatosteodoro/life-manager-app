import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/services/user.types';

export type { Theme };

/**
 * Aplica/remove a classe `.dark` no <html> (a fonte do tema para o CSS).
 * `custom` ainda não faz nada — renderiza como claro por ora.
 */
function applyThemeClass(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

/**
 * Tema da interface, persistido no navegador (localStorage `lm_theme`).
 *
 * Mesma estratégia dos outros stores: `skipHydration` evita mismatch de
 * hidratação no Next (nasce em 'light', igual ao SSR) e o estado salvo é
 * carregado via `rehydrate()` no mount. A classe `.dark` é aplicada no
 * `setTheme` e ao reidratar; no primeiro paint quem aplica é o script inline
 * do layout (anti-FOUC), lendo este mesmo localStorage.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        applyThemeClass(theme);
        set({ theme });
      },
      toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
    }),
    {
      name: 'lm_theme',
      skipHydration: true,
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.theme);
      },
    },
  ),
);
