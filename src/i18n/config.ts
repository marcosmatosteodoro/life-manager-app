import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { defaultNS, ns, resources } from './resources';

export type Locale = 'en' | 'pt';

/**
 * Inicializa (uma vez) a instância i18next com os recursos bundlados.
 * `useSuspense:false` evita boundary de Suspense nos componentes client.
 */
export function initI18n(lng: Locale): typeof i18n {
  if (!i18n.isInitialized) {
    void i18n.use(initReactI18next).init({
      resources,
      lng,
      fallbackLng: 'en',
      ns: [...ns],
      defaultNS,
      interpolation: { escapeValue: false }, // React já escapa
      react: { useSuspense: false },
    });
  }
  return i18n;
}

export default i18n;
