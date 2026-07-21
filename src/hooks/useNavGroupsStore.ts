import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavGroupsState {
  /** Grupos recolhidos, por chave i18n do label (ex.: { groupJobs: true }). */
  collapsed: Record<string, boolean>;
  toggle: (label: string) => void;
}

/**
 * Preferência de recolher/expandir os grupos da sidebar, persistida no
 * navegador (localStorage `lm_nav_groups`). Só os grupos com label são
 * recolhíveis; os itens soltos do topo não têm estado aqui.
 *
 * Mesma estratégia dos outros stores: `skipHydration` evita mismatch de
 * hidratação no Next (nasce vazio, igual ao SSR) e o salvo é carregado via
 * `rehydrate()` no mount (ver Sidebar).
 */
export const useNavGroupsStore = create<NavGroupsState>()(
  persist(
    (set) => ({
      collapsed: {},
      toggle: (label) =>
        set((state) => ({
          collapsed: { ...state.collapsed, [label]: !state.collapsed[label] },
        })),
    }),
    {
      name: 'lm_nav_groups',
      skipHydration: true,
      partialize: (state) => ({ collapsed: state.collapsed }),
    },
  ),
);
