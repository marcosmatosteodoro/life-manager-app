import { create } from 'zustand';

interface SidebarState {
  /** Desktop: quando true, a sidebar fica recolhida (apenas ícones). */
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  /** Mobile: drawer em tela cheia aberto/fechado. */
  mobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

/**
 * Estado global da sidebar via zustand.
 * - `collapsed`: comportamento de recolher no desktop.
 * - `mobileOpen`: drawer em tela cheia no mobile.
 */
export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  toggle: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapsed: (collapsed) => set({ collapsed }),
  mobileOpen: false,
  toggleMobile: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
  closeMobile: () => set({ mobileOpen: false }),
}));
