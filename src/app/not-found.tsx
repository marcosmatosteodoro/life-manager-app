'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

/**
 * 404 — renderizado para URLs que não casam com nenhuma rota e quando algum
 * segmento chama `notFound()`.
 */
export default function NotFound() {
  const { t } = useTranslation('common');
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center text-center">
      <span className="text-5xl font-semibold tracking-tight text-fg-subtle">
        404
      </span>
      <h1 className="mt-4 text-xl font-semibold text-fg">
        {t('notFoundTitle')}
      </h1>
      <p className="mt-2 text-sm text-fg-muted">
        {t('notFoundDescription')}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-surface-inverse px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-fg-soft"
      >
        {t('backToHome')}
      </Link>
    </section>
  );
}
