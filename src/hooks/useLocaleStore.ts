import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n, { type Locale } from '@/i18n/config';
import type { Language } from '@/services/user.types';

export type { Locale };

/** Mapeia o `language` do perfil (pt-BR/en-US) para o locale do i18n (pt/en). */
export const toLocale = (language: Language): Locale =>
  language === 'en-US' ? 'en' : 'pt';

/** Aplica o idioma no i18next e no atributo lang do <html>. */
function applyLocale(locale: Locale): void {
  if (i18n.isInitialized && i18n.language !== locale) {
    void i18n.changeLanguage(locale);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale === 'en' ? 'en-US' : 'pt-BR';
  }
}

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

/**
 * Idioma da UI, persistido no navegador (localStorage `lm_locale`). Mesma
 * estratégia do tema: `skipHydration` + `rehydrate()` no mount. A fonte da
 * verdade entre dispositivos é o `profile.language` (aplicado ao carregar /me).
 */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'pt',
      setLocale: (locale) => {
        applyLocale(locale);
        set({ locale });
      },
    }),
    {
      name: 'lm_locale',
      skipHydration: true,
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        if (state) applyLocale(state.locale);
      },
    },
  ),
);

/** Locale lido síncrono do localStorage (para o I18nProvider no 1º render). */
export function readLocaleFromStorage(): Locale {
  if (typeof window === 'undefined') return 'pt';
  try {
    const raw = window.localStorage.getItem('lm_locale');
    if (!raw) return 'pt';
    const parsed = JSON.parse(raw) as { state?: { locale?: Locale } };
    return parsed.state?.locale ?? 'pt';
  } catch {
    return 'pt';
  }
}
