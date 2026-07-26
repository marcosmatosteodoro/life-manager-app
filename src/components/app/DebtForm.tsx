'use client';

import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { toast } from '@/hooks/useToastStore';
import { ApiError, debtService } from '@/services/debtService';
import type { Debt } from '@/services/debt.types';

interface DebtFormProps {
  initial?: Debt | null;
  onSaved: () => void;
  onCancel: () => void;
}

/** Cadastro/edição de uma dívida (nome, valor total, descrição). */
export function DebtForm({ initial, onSaved, onCancel }: DebtFormProps) {
  const { t } = useTranslation(['debts', 'common']);
  const [name, setName] = useState(initial?.name ?? '');
  const [totalAmount, setTotalAmount] = useState(
    initial ? String(initial.totalAmount) : '',
  );
  const [description, setDescription] = useState(initial?.description ?? '');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const input = {
        name: name.trim(),
        totalAmount: Number(totalAmount),
        description: description.trim() ? description.trim() : null,
      };
      if (initial) {
        await debtService.update(initial.id, input);
      } else {
        await debtService.create(input);
      }
      toast.success(initial ? t('debts:updated') : t('debts:created'));
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
      <Field label={t('debts:form.name')} htmlFor="debt-name">
        <input
          id="debt-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('debts:form.namePlaceholder')}
          className={inputClass}
        />
      </Field>

      <Field label={t('debts:form.totalAmount')} htmlFor="debt-total">
        <input
          id="debt-total"
          type="number"
          step="0.01"
          min="0"
          required
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label={t('debts:form.description')} htmlFor="debt-desc">
        <textarea
          id="debt-desc"
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
              : t('debts:form.create')}
        </Button>
      </div>
    </form>
  );
}
