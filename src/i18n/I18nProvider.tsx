'use client';

import { type ReactNode, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { readLocaleFromStorage } from '@/hooks/useLocaleStore';
import { initI18n } from './config';

/**
 * Provider client do i18next. Inicializa com o locale lido síncrono do
 * localStorage (mirror do tema), então não há flash de idioma nem mismatch.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [instance] = useState(() => initI18n(readLocaleFromStorage()));
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
