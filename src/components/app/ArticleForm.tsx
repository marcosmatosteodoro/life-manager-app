'use client';

import { type FormEvent, type ReactNode, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Article, ArticleInput } from '@/services/article.types';

interface ArticleFormProps {
  /** Quando presente, o formulário está em modo edição. */
  initial?: Article | null;
  submitting: boolean;
  onSubmit: (input: ArticleInput) => void;
  onCancel: () => void;
}

/** Formulário compartilhado entre "novo estudo" e "editar estudo". */
export function ArticleForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: ArticleFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [link, setLink] = useState(initial?.link ?? '');
  const [readingTime, setReadingTime] = useState(
    initial ? String(initial.readingTime) : '',
  );
  const [timeRead, setTimeRead] = useState(
    initial?.timeRead != null ? String(initial.timeRead) : '',
  );
  const [timeWrite, setTimeWrite] = useState(
    initial?.timeWrite != null ? String(initial.timeWrite) : '',
  );
  const [score, setScore] = useState(
    initial?.score != null ? String(initial.score) : '',
  );
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [summaryCorrected, setSummaryCorrected] = useState(
    initial?.summaryCorrected ?? '',
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    // Campos numéricos opcionais viram número ou null; textos vazios viram null.
    const optionalInt = (v: string) => (v.trim() === '' ? null : Number(v));
    const optionalText = (v: string) => (v.trim() === '' ? null : v);
    onSubmit({
      title: title.trim(),
      link: optionalText(link),
      readingTime: Number(readingTime),
      timeRead: optionalInt(timeRead),
      timeWrite: optionalInt(timeWrite),
      score: optionalInt(score),
      summary: optionalText(summary),
      summaryCorrected: optionalText(summaryCorrected),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Título" htmlFor="title">
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: The Pragmatic Programmer"
          className={inputClass}
        />
      </Field>

      <Field label="Link (opcional)" htmlFor="link">
        <input
          id="link"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tempo de leitura (min)" htmlFor="readingTime">
          <input
            id="readingTime"
            type="number"
            min="1"
            required
            value={readingTime}
            onChange={(e) => setReadingTime(e.target.value)}
            placeholder="Ex.: 5"
            className={inputClass}
          />
        </Field>
        <Field label="Tempo lendo (min)" htmlFor="timeRead">
          <input
            id="timeRead"
            type="number"
            min="1"
            value={timeRead}
            onChange={(e) => setTimeRead(e.target.value)}
            placeholder="Opcional"
            className={inputClass}
          />
        </Field>
        <Field label="Tempo escrevendo (min)" htmlFor="timeWrite">
          <input
            id="timeWrite"
            type="number"
            min="1"
            value={timeWrite}
            onChange={(e) => setTimeWrite(e.target.value)}
            placeholder="Opcional"
            className={inputClass}
          />
        </Field>
        <Field label="Nota" htmlFor="score">
          <input
            id="score"
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Opcional"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Resumo" htmlFor="summary">
        <textarea
          id="summary"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Opcional"
          className={inputClass}
        />
      </Field>

      <Field label="Resumo corrigido" htmlFor="summaryCorrected">
        <textarea
          id="summaryCorrected"
          rows={3}
          value={summaryCorrected}
          onChange={(e) => setSummaryCorrected(e.target.value)}
          placeholder="Opcional"
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

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900';

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
