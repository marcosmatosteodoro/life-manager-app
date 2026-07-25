'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import type { Expense } from '@/services/expense.types';
import { cn } from '@/utils/cn';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
const dateFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

const TYPE_CLASSES: Record<Expense['type'], string> = {
  debito: 'bg-sky-100 text-sky-800',
  credito: 'bg-purple-100 text-purple-800',
  a_vista: 'bg-emerald-100 text-emerald-800',
  pix: 'bg-teal-100 text-teal-800',
};

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const { t } = useTranslation(['expenses', 'common']);

  if (expenses.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
        {t('expenses:empty')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          className="flex items-start justify-between gap-3 rounded-lg border border-edge bg-surface px-4 py-3"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 truncate font-medium text-fg">
                {expense.title}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                  TYPE_CLASSES[expense.type],
                )}
              >
                {t(`expenses:type.${expense.type}`)}
                {expense.type === 'credito' && expense.installments
                  ? ` ${expense.installments}x`
                  : ''}
              </span>
              {expense.category && (
                <span className="shrink-0 rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-medium text-fg-muted">
                  {expense.category.name}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-fg-muted">
              {money.format(expense.value)}
              {' · '}
              {dateFmt.format(new Date(`${expense.date}T00:00:00Z`))}
              {expense.hasAudio ? ' · 🎤' : ''}
              {expense.photoCount ? ` · 📷 ${expense.photoCount}` : ''}
            </p>
            {expense.description ? (
              <p className="mt-1 whitespace-pre-line text-sm text-fg-subtle">
                {expense.description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" onClick={() => onEdit(expense)}>
              {t('common:edit')}
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(expense)}
            >
              {t('common:delete')}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
