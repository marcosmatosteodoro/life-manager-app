'use client';

import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { toast } from '@/hooks/useToastStore';
import { WEEKDAYS, type Todo, type TodoInput } from '@/services/todo.types';
import { cn } from '@/utils/cn';
import { todayDate } from '@/utils/date';

interface TodoFormProps {
  initial?: Todo | null;
  /** Tags existentes para o autocomplete do campo de tag. */
  tags?: string[];
  submitting: boolean;
  onSubmit: (input: TodoInput) => void;
  onCancel: () => void;
}

export function TodoForm({
  initial,
  tags = [],
  submitting,
  onSubmit,
  onCancel,
}: TodoFormProps) {
  const { t } = useTranslation(['todo', 'common']);
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  // Novo afazer começa com início = hoje.
  const [startDate, setStartDate] = useState(
    initial?.startDate ?? todayDate(),
  );
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [days, setDays] = useState<number[]>(initial?.days ?? []);
  const [tag, setTag] = useState(initial?.tag ?? '');

  function toggleDay(value: number) {
    setDays((cur) =>
      cur.includes(value) ? cur.filter((d) => d !== value) : [...cur, value],
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (days.length === 0) {
      toast.error(t('todo:form.selectDay'));
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      startDate,
      endDate: endDate ? endDate : null,
      days: [...days].sort((a, b) => a - b),
      tag: tag.trim() ? tag.trim() : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t('todo:form.name')} htmlFor="name">
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('todo:form.namePlaceholder')}
          className={inputClass}
        />
      </Field>

      <Field label={t('todo:form.description')} htmlFor="description">
        <textarea
          id="description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('todo:form.descriptionPlaceholder')}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t('todo:form.start')} htmlFor="startDate">
          <input
            id="startDate"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t('todo:form.end')} htmlFor="endDate">
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-fg-soft">
          {t('todo:form.weekdays')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((w) => {
            const active = days.includes(w.value);
            return (
              <button
                key={w.value}
                type="button"
                onClick={() => toggleDay(w.value)}
                aria-pressed={active}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-edge-inverse bg-surface-inverse text-surface'
                    : 'border-edge-strong text-fg-soft hover:bg-surface-subtle',
                )}
              >
                {t(w.shortKey)}
              </button>
            );
          })}
        </div>
      </div>

      <Field label={t('todo:form.tag')} htmlFor="tag">
        {/* Autocomplete: sugere tags existentes; texto novo vira tag nova. */}
        <input
          id="tag"
          type="text"
          list="todo-tags"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder={t('todo:form.tagPlaceholder')}
          className={inputClass}
        />
        <datalist id="todo-tags">
          {tags.map((tagOption) => (
            <option key={tagOption} value={tagOption} />
          ))}
        </datalist>
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
              : t('todo:form.submitCreate')}
        </Button>
      </div>
    </form>
  );
}
