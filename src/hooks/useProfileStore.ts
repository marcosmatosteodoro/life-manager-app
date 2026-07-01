import { create } from 'zustand';
import { userService } from '@/services/userService';
import type { UserProfile } from '@/services/user.types';
import { useThemeStore } from './useThemeStore';

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  /** Carrega /me e aplica o tema salvo no servidor. Retorna o perfil (ou null). */
  load: () => Promise<UserProfile | null>;
  setProfile: (profile: UserProfile) => void;
  clear: () => void;
}

/**
 * Perfil do usuário logado (não persistido — vem do back a cada sessão).
 * Ao carregar, reconcilia o tema com o do servidor (fonte da verdade entre
 * dispositivos); o script inline do layout já evitou o flash antes disso.
 */
export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const profile = await userService.getMe();
      useThemeStore.getState().setTheme(profile.theme);
      set({ profile, loading: false });
      return profile;
    } catch {
      set({ loading: false });
      return null;
    }
  },

  setProfile: (profile) => {
    useThemeStore.getState().setTheme(profile.theme);
    set({ profile });
  },

  clear: () => set({ profile: null }),
}));
