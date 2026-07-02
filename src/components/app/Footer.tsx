'use client';

import { useTranslation } from 'react-i18next';

/** Rodapé padrão da aplicação. */
export function Footer() {
  const { t } = useTranslation('common');
  return (
    <footer className="border-t border-edge px-4 py-4 text-center text-sm text-fg-muted">
      {t('footerRights')}
    </footer>
  );
}
