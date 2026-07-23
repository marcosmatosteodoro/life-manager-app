'use client';

import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import type {
  Problem,
  ProblemCategory,
  ProblemInput,
  ProblemPriority,
  ProblemStatus,
} from '@/services/problem.types';
import { PROBLEM_PRIORITIES, PROBLEM_STATUSES } from '@/services/problemService';

interface ProblemFormProps {
  initial?: Problem | null;
  categories: ProblemCategory[];
  submitting: boolean;
  onSubmit: (input: ProblemInput) => void;
  onCancel: () => void;
}

export function ProblemForm({
  initial,
  categories,
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
  const [priority, setPriority] = useState<ProblemPriority>(
    initial?.priority ?? 'media',
  );
  // '' = sem categoria (opcional).
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId != null ? String(initial.categoryId) : '',
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      title: title.trim(),
      status,
      priority,
      description: description.trim() ? description.trim() : null,
      categoryId: categoryId === '' ? null : Number(categoryId),
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

      <Field label={t('form.priority')} htmlFor="problem-priority">
        <select
          id="problem-priority"
          required
          value={priority}
          onChange={(e) => setPriority(e.target.value as ProblemPriority)}
          className={inputClass}
        >
          {PROBLEM_PRIORITIES.map((value) => (
            <option key={value} value={value}>
              {t(`priority.${value}`)}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t('form.category')} htmlFor="problem-category">
        <select
          id="problem-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={inputClass}
        >
          <option value="">{t('form.categoryNone')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
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
