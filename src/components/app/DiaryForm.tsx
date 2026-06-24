'use client';

import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import type { Diary } from '@/services/diary.types';
import { todayDate } from '@/utils/date';

interface DiaryFormProps {
  initial?: Diary | null;
  submitting: boolean;
  onSubmit: (input: { day: string; description: string }) => void;
  onCancel: () => void;
}

/** Formulário compartilhado entre criar e editar um registro de diário. */
export function DiaryForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: DiaryFormProps) {
  const [day, setDay] = useState(initial?.day ?? todayDate());
  const [description, setDescription] = useState(initial?.description ?? '');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ day, description: description.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Dia" htmlFor="day">
        <input
          id="day"
          type="date"
          required
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Descrição" htmlFor="description">
        <textarea
          id="description"
          rows={6}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Escreva aqui..."
          className={inputClass}
        />
      </Field>
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : initial ? 'Salvar' : 'Registrar'}
        </Button>
      </div>
    </form>
  );
}
