'use client';

import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { toast } from '@/hooks/useToastStore';
import { ApiError, fixedExpenseService } from '@/services/fixedExpenseService';
import type { FixedExpense } from '@/services/fixedExpense.types';

interface FixedExpenseFormProps {
  initial?: FixedExpense | null;
  onSaved: () => void;
  onCancel: () => void;
}

/** Cadastro/edição de um gasto fixo (nome, valor, dia e flag variável). */
export function FixedExpenseForm({
  initial,
  onSaved,
  onCancel,
}: FixedExpenseFormProps) {
  const { t } = useTranslation(['fixedExpenses', 'common']);
  const [name, setName] = useState(initial?.name ?? '');
  const [value, setValue] = useState(initial ? String(initial.value) : '');
  const [paymentDay, setPaymentDay] = useState(
    initial ? String(initial.paymentDay) : '',
  );
  const [isVariable, setIsVariable] = useState(initial?.isVariable ?? false);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const input = {
        name: name.trim(),
        value: Number(value),
        paymentDay: Number(paymentDay),
        isVariable,
        description: description.trim() ? description.trim() : null,
      };
      if (initial) {
        await fixedExpenseService.update(initial.id, input);
      } else {
        await fixedExpenseService.create(input);
      }
      toast.success(
        initial ? t('fixedExpenses:updated') : t('fixedExpenses:created'),
      );
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
      <Field label={t('fixedExpenses:form.name')} htmlFor="fx-name">
        <input
          id="fx-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('fixedExpenses:form.namePlaceholder')}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t('fixedExpenses:form.value')} htmlFor="fx-value">
          <input
            id="fx-value"
            type="number"
            step="0.01"
            min="0"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t('fixedExpenses:form.paymentDay')} htmlFor="fx-day">
          <input
            id="fx-day"
            type="number"
            min={1}
            max={31}
            step={1}
            required
            value={paymentDay}
            onChange={(e) => setPaymentDay(e.target.value)}
            placeholder="1"
            className={inputClass}
          />
        </Field>
      </div>

      <label className="flex items-start gap-2 text-sm text-fg-soft">
        <input
          type="checkbox"
          checked={isVariable}
          onChange={(e) => setIsVariable(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          <span className="font-medium">{t('fixedExpenses:form.isVariable')}</span>
          <span className="mt-0.5 block text-xs text-fg-muted">
            {t('fixedExpenses:form.isVariableHint')}
          </span>
        </span>
      </label>

      <Field label={t('fixedExpenses:form.description')} htmlFor="fx-desc">
        <textarea
          id="fx-desc"
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
          {submitting
            ? t('common:saving')
            : initial
              ? t('common:save')
              : t('fixedExpenses:form.create')}
        </Button>
      </div>
    </form>
  );
}
