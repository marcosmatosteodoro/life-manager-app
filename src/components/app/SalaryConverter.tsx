'use client';

import { useState } from 'react';

const inputClass =
  'w-full rounded-md border border-edge-strong px-3 py-2 text-sm text-fg outline-none transition-colors focus:border-edge-inverse';

const num = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const parse = (s: string) => Number(s.replace(',', '.'));

export function SalaryConverter() {
  const [annual, setAnnual] = useState('120000');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [discount, setDiscount] = useState('0');

  const annualNum = parse(annual);
  const hours = parse(hoursPerWeek);
  const disc = parse(discount);

  const valid = Number.isFinite(annualNum) && annualNum > 0;
  const monthly = valid ? annualNum / 12 : null;
  const weekly = valid ? annualNum / 52 : null;
  const hourly =
    valid && Number.isFinite(hours) && hours > 0
      ? annualNum / (52 * hours)
      : null;

  const discFrac =
    Number.isFinite(disc) && disc > 0 && disc < 100 ? disc / 100 : 0;
  const netAnnual = valid ? annualNum * (1 - discFrac) : null;
  const netMonthly = netAnnual != null ? netAnnual / 12 : null;

  return (
    <div className="rounded-lg border border-edge bg-surface p-4">
      <h2 className="text-sm font-semibold text-fg">
        💰 Conversor de salário
      </h2>
      <p className="mt-0.5 text-xs text-fg-muted">
        De anual (como as vagas costumam anunciar) para mensal, semanal e por
        hora. Valores na mesma moeda que você informar.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-fg-soft">
            Salário anual
          </span>
          <input
            inputMode="decimal"
            value={annual}
            onChange={(e) => setAnnual(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:w-32">
          <span className="text-sm font-medium text-fg-soft">
            Horas/semana
          </span>
          <input
            inputMode="decimal"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Mensal" value={monthly} />
        <Stat label="Semanal" value={weekly} />
        <Stat label="Por hora" value={hourly} />
      </dl>

      {/* Líquido aproximado */}
      <div className="mt-5 border-t border-edge pt-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-fg-soft">
            Desconto estimado (impostos etc.) %
          </span>
          <input
            inputMode="decimal"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className={`${inputClass} sm:w-32`}
          />
        </label>
        <p className="mt-1 text-xs text-fg-subtle">
          Estimativa simples: aplica a porcentagem sobre o bruto. Impostos reais
          variam por país/faixa.
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Líquido anual (aprox.)" value={netAnnual} />
          <Stat label="Líquido mensal (aprox.)" value={netMonthly} />
        </dl>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-md bg-surface-muted px-3 py-2">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="text-base font-semibold text-fg tabular-nums">
        {value != null ? num.format(value) : '—'}
      </dd>
    </div>
  );
}
