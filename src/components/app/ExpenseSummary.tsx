'use client';

import { useTranslation } from 'react-i18next';
import type { ExpenseSummary as ExpenseSummaryData } from '@/services/expense.types';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Resumo do mês: total gasto e para onde foi (por categoria). */
export function ExpenseSummary({ summary }: { summary: ExpenseSummaryData }) {
  const { t } = useTranslation('expenses');
  const max = summary.byCategory.reduce((m, c) => Math.max(m, c.total), 0);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-edge bg-surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
            {t('summary.monthTotal')}
          </p>
          <p className="mt-1 text-2xl font-semibold text-fg">
            {money.format(summary.monthTotal)}
          </p>
        </div>
        <p className="text-sm text-fg-muted">
          {t('summary.count', { count: summary.count })}
        </p>
      </div>

      {summary.byCategory.length === 0 ? (
        <p className="text-sm text-fg-muted">{t('summary.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {summary.byCategory.map((c) => (
            <li key={c.categoryId ?? 'none'} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="min-w-0 truncate text-fg-soft">
                  {c.name || t('summary.noCategory')}
                </span>
                <span className="font-medium text-fg">
                  {money.format(c.total)}
                </span>
              </div>
              {/* Barra proporcional ao maior gasto do mês. */}
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-subtle">
                <div
                  className="h-full rounded-full bg-surface-inverse"
                  style={{ width: `${max > 0 ? (c.total / max) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
