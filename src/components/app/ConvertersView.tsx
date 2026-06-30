'use client';

import { CurrencyConverter } from './CurrencyConverter';
import { SalaryConverter } from './SalaryConverter';
import { TimezoneConverter } from './TimezoneConverter';

/** Página de conversores úteis para avaliar vagas remotas internacionais. */
export function ConvertersView() {
  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">
        Conversores
      </h1>
      <p className="mt-1 text-sm text-fg-muted">
        Ferramentas rápidas para avaliar vagas: moeda, fuso horário e salário.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <CurrencyConverter />
        <SalaryConverter />
        <TimezoneConverter />
      </div>
    </section>
  );
}
