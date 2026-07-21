'use client';

import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import type { Problem, ProblemInput, ProblemStatus } from '@/services/problem.types';
import { PROBLEM_STATUSES } from '@/services/problemService';

interface ProblemFormProps {
  initial?: Problem | null;
  submitting: boolean;
  onSubmit: (input: ProblemInput) => void;
  onCancel: () => void;
}

export function ProblemForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: ProblemFormProps) {
  const { t } = useTranslation(['problems', 'common']);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<ProblemStatus>(
    initial?.status ?? 'pendente',
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      title: title.trim(),
      status,
      description: description.trim() ? description.trim() : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t('form.title')} htmlFor="problem-title">
        <input
          id="problem-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('form.titlePlaceholder')}
          className={inputClass}
        />
      </Field>

      <Field label={t('form.status')} htmlFor="problem-status">
        <select
          id="problem-status"
          required
          value={status}
          onChange={(e) => setStatus(e.target.value as ProblemStatus)}
          className={inputClass}
        >
          {PROBLEM_STATUSES.map((value) => (
            <option key={value} value={value}>
              {t(`status.${value}`)}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t('form.description')} htmlFor="problem-description">
        <textarea
          id="problem-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('form.descriptionPlaceholder')}
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
            ? t('form.saving')
            : initial
              ? t('form.save')
              : t('form.create')}
        </Button>
      </div>
    </form>
  );
}
