'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ApiError,
  converterService,
  type ExchangeRate,
} from '@/services/converterService';

type From = 'USD' | 'CAD';
type LoadState = 'loading' | 'loaded' | 'error';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState<From>('USD');
  const [data, setData] = useState<ExchangeRate | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [error, setError] = useState<string>('');
  const [useManual, setUseManual] = useState(false);
  const [manualRate, setManualRate] = useState('');

  const load = useCallback(async (base: From) => {
    setLoadState('loading');
    setError('');
    try {
      const result = await converterService.exchangeRate(base, 'BRL');
      setData(result);
      setLoadState('loaded');
    } catch (err) {
      // Sem cotação automática: cai para o modo manual.
      setError(toMessage(err));
      setUseManual(true);
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load(from);
  }, [from, load]);

  const autoRate = data && data.base === from ? data.rate : null;
  const effectiveRate = useManual ? Number(manualRate) : autoRate;
  const amountNum = Number(amount.replace(',', '.'));
  const valid =
    Number.isFinite(amountNum) &&
    effectiveRate != null &&
    Number.isFinite(effectiveRate) &&
    effectiveRate > 0;
  const converted = valid ? amountNum * effectiveRate : null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">
        💱 Conversor de moeda
      </h2>
      <p className="mt-0.5 text-xs text-neutral-500">
        Converte salários/valores de vagas (USD/CAD) para reais.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Valor</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Moeda</span>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as From)}
            className={inputClass}
          >
            <option value="USD">USD (dólar)</option>
            <option value="CAD">CAD (dólar canadense)</option>
          </select>
        </label>
      </div>

      <div className="mt-4 rounded-md bg-neutral-50 px-3 py-3 text-center">
        <span className="text-xs text-neutral-400">Em reais</span>
        <p className="text-2xl font-semibold text-neutral-900">
          {converted != null ? brl.format(converted) : '—'}
        </p>
      </div>

      {/* Origem da taxa */}
      <div className="mt-3 text-xs text-neutral-500">
        {loadState === 'loading' && <span>Buscando cotação…</span>}
        {loadState === 'loaded' && autoRate != null && !useManual && (
          <span>
            1 {from} = {brl.format(autoRate)} · atualizado{' '}
            {data?.date ? formatDate(data.date) : ''}
          </span>
        )}
        {error && <span className="text-amber-700">{error}</span>}
      </div>

      <label className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
        <input
          type="checkbox"
          checked={useManual}
          onChange={(e) => setUseManual(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-neutral-300"
        />
        Usar taxa manual
      </label>

      {useManual && (
        <label className="mt-2 flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">
            Taxa (1 {from} em R$)
          </span>
          <input
            inputMode="decimal"
            placeholder="ex.: 5,40"
            value={manualRate}
            onChange={(e) => setManualRate(e.target.value.replace(',', '.'))}
            className={inputClass}
          />
        </label>
      )}
    </div>
  );
}

function formatDate(raw: string): string {
  const d = new Date(raw);
  return Number.isNaN(d.getTime())
    ? raw
    : new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }).format(d);
}

function toMessage(error: unknown): string {
  if (error instanceof ApiError) return error.messages.join(' ');
  return 'Não foi possível buscar a cotação. Informe a taxa manualmente.';
}
