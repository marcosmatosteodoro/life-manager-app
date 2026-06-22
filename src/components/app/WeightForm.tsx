'use client';

import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Weight, WeightInput } from '@/services/weight.types';

interface WeightFormProps {
  /** Quando presente, o formulário está em modo edição. */
  initial?: Weight | null;
  submitting: boolean;
  onSubmit: (input: WeightInput) => void;
  onCancel: () => void;
}

/** Formulário compartilhado entre "novo peso" e "editar peso". */
export function WeightForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: WeightFormProps) {
  const [value, setValue] = useState(initial ? String(initial.value) : '');
  // Ao criar, data e hora vêm preenchidas com o momento atual.
  const [date, setDate] = useState(initial?.date ?? currentDate());
  // input type=time usa HH:MM; recorta o HH:MM:SS vindo da API.
  const [time, setTime] = useState(initial?.time?.slice(0, 5) ?? currentTime());

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      value: Number(value),
      date,
      time: time ? time : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Peso (kg)" htmlFor="value">
        <input
          id="value"
          type="number"
          step="0.01"
          min="0"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ex.: 81.55"
          className={inputClass}
        />
      </Field>

      <Field label="Data" htmlFor="date">
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Hora (opcional)" htmlFor="time">
        <input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
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

const pad = (n: number) => String(n).padStart(2, '0');

/** Data local de hoje no formato YYYY-MM-DD. */
function currentDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Hora local atual no formato HH:MM. */
function currentTime(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900';

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
