import { create } from 'zustand';

interface SidebarState {
  /** Quando true, a sidebar fica recolhida (apenas ícones). */
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

/**
 * Estado global da sidebar (expandida/recolhida) via zustand.
 * Consumido como hook pelos componentes que precisam reagir ao estado.
 */
export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  toggle: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapsed: (collapsed) => set({ collapsed }),
}));
