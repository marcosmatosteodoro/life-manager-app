'use client';

import { useCallback } from 'react';
import { toast } from '@/hooks/useToastStore';
import { ApiError, userService } from '@/services/userService';
import { useProfileStore } from './useProfileStore';
import { useThemeStore } from './useThemeStore';

/**
 * Alterna claro/escuro aplicando o visual e o localStorage na hora e
 * persistindo no perfil (banco) em seguida. Se o back falhar, o visual local
 * é mantido (não reverte) e mostra um toast.
 */
export function useThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setProfile = useProfileStore((s) => s.setProfile);

  const toggle = useCallback(async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next); // visual + localStorage imediatos
    try {
      const updated = await userService.updateMe({ theme: next });
      setProfile(updated);
    } catch (error) {
      const messages =
        error instanceof ApiError
          ? error.messages
          : ['Não foi possível salvar o tema no perfil.'];
      toast.errors(messages);
    }
  }, [theme, setTheme, setProfile]);

  return { theme, toggle };
}
