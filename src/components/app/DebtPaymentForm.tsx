'use client';

import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { toast } from '@/hooks/useToastStore';
import { ApiError, debtService } from '@/services/debtService';
import type { Debt } from '@/services/debt.types';

const pad = (n: number) => String(n).padStart(2, '0');
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

interface DebtPaymentFormProps {
  debt: Debt;
  onSaved: () => void;
  onCancel: () => void;
}

/** Registra uma quitação (parcial ou total) da dívida; gera um gasto. */
export function DebtPaymentForm({
  debt,
  onSaved,
  onCancel,
}: DebtPaymentFormProps) {
  const { t } = useTranslation(['debts', 'common']);
  const remaining = debt.remaining ?? 0;
  const [settleAll, setSettleAll] = useState(false);
  const [value, setValue] = useState('');
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await debtService.addPayment(debt.id, {
        value: settleAll ? undefined : Number(value),
        date,
        description: description.trim() ? description.trim() : null,
        settleAll,
      });
      toast.success(t('debts:paymentAdded'));
      onSaved();
    } catch (error) {
      toast.errors(
        error instanceof ApiError
          ? error.messages
          : [t('common:unexpectedError')],
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="rounded-lg bg-surface-subtle px-3 py-2 text-sm text-fg-muted">
        {t('debts:remainingLabel')}{' '}
        <span className="font-semibold text-fg">{money.format(remaining)}</span>
      </p>

      <label className="flex items-center gap-2 text-sm text-fg-soft">
        <input
          type="checkbox"
          checked={settleAll}
          onChange={(e) => setSettleAll(e.target.checked)}
        />
        <span className="font-medium">
          {t('debts:form.settleAll', { value: money.format(remaining) })}
        </span>
      </label>

      {!settleAll && (
        <Field label={t('debts:form.paymentValue')} htmlFor="pay-value">
          <input
            id="pay-value"
            type="number"
            step="0.01"
            min="0"
            max={remaining}
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
          />
        </Field>
      )}

      <Field label={t('debts:form.paymentDate')} htmlFor="pay-date">
        <input
          id="pay-date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label={t('debts:form.description')} htmlFor="pay-desc">
        <textarea
          id="pay-desc"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="mt-2 flex justify-end gap-2">
        <Button
          variant="secondary"
          type="button"
          onClick={onCancel}
          disabled={submitting}
        >
          {t('common:cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? t('common:saving') : t('debts:form.registerPayment')}
        </Button>
      </div>
    </form>
  );
}
