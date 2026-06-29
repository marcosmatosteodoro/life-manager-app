'use client';

import { type FormEvent, useState } from 'react';
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
      toast.error('Selecione ao menos um dia da semana.');
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
      <Field label="Nome" htmlFor="name">
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Treinar"
          className={inputClass}
        />
      </Field>

      <Field label="Descrição (opcional)" htmlFor="description">
        <textarea
          id="description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalhes do afazer"
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Início" htmlFor="startDate">
          <input
            id="startDate"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Fim (opcional)" htmlFor="endDate">
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
        <span className="text-sm font-medium text-neutral-700">
          Dias da semana
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
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100',
                )}
              >
                {w.short}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Tag (opcional)" htmlFor="tag">
        {/* Autocomplete: sugere tags existentes; texto novo vira tag nova. */}
        <input
          id="tag"
          type="text"
          list="todo-tags"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Escolha uma existente ou digite uma nova"
          className={inputClass}
        />
        <datalist id="todo-tags">
          {tags.map((t) => (
            <option key={t} value={t} />
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
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : initial ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
