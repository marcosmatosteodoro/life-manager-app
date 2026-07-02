'use client';

import { useTranslation } from 'react-i18next';
import { CurrencyConverter } from './CurrencyConverter';
import { SalaryConverter } from './SalaryConverter';
import { TimezoneConverter } from './TimezoneConverter';

/** Página de conversores úteis para avaliar vagas remotas internacionais. */
export function ConvertersView() {
  const { t } = useTranslation('converters');

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">
        {t('title')}
      </h1>
      <p className="mt-1 text-sm text-fg-muted">
        {t('subtitle')}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <CurrencyConverter />
        <SalaryConverter />
        <TimezoneConverter />
      </div>
    </section>
  );
}
