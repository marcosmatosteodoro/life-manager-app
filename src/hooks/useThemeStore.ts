import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomColors, Theme } from '@/services/user.types';
import { applyTheme } from '@/utils/theme';

export type { Theme };

interface ThemeState {
  theme: Theme;
  /** Paleta do tema custom (token → hex). Null enquanto não personalizado. */
  customColors: CustomColors | null;
  setTheme: (theme: Theme) => void;
  setCustomColors: (colors: CustomColors) => void;
}

/**
 * Tema da interface, persistido no navegador (localStorage `lm_theme`).
 *
 * Mesma estratégia dos outros stores: `skipHydration` evita mismatch de
 * hidratação no Next (nasce em 'light', igual ao SSR) e o estado salvo é
 * carregado via `rehydrate()` no mount. O visual (classe `.dark` e as variáveis
 * do custom) é aplicado no `setTheme`/`setCustomColors` e ao reidratar; no
 * primeiro paint quem aplica é o script inline do layout (anti-FOUC).
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      customColors: null,
      setTheme: (theme) => {
        applyTheme(theme, get().customColors);
        set({ theme });
      },
      setCustomColors: (colors) => {
        applyTheme('custom', colors);
        set({ theme: 'custom', customColors: colors });
      },
    }),
    {
      name: 'lm_theme',
      skipHydration: true,
      partialize: (state) => ({
        theme: state.theme,
        customColors: state.customColors,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme, state.customColors);
      },
    },
  ),
);
