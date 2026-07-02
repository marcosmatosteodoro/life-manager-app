'use client';

import { type FormEvent, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { SafeHtml } from '@/components/ui/SafeHtml';
import type { Article, ArticleInput } from '@/services/article.types';

interface ArticleFormProps {
  /** Quando presente, o formulário está em modo edição. */
  initial?: Article | null;
  submitting: boolean;
  onSubmit: (input: ArticleInput) => void;
  /** Dispara a correção via IA; devolve o artigo atualizado (ou null em erro). */
  onCorrect: (id: number) => Promise<Article | null>;
  onCancel: () => void;
}

/** Formulário compartilhado entre "novo estudo" e "editar estudo". */
export function ArticleForm({
  initial,
  submitting,
  onSubmit,
  onCorrect,
  onCancel,
}: ArticleFormProps) {
  const { t } = useTranslation(['articles', 'common']);
  const [correcting, setCorrecting] = useState(false);
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

  // A correção usa o resumo SALVO no back. Por isso só liberamos quando o
  // artigo já existe, há resumo, e o campo não tem alterações pendentes.
  const summaryDirty = (initial?.summary ?? '') !== summary;
  const canCorrect =
    !!initial && summary.trim() !== '' && !summaryDirty && !submitting;

  async function handleCorrect() {
    if (!initial) return;
    setCorrecting(true);
    try {
      const updated = await onCorrect(initial.id);
      if (updated) {
        // Preenche os campos editáveis; o usuário ainda pode ajustar à mão.
        setSummaryCorrected(updated.summaryCorrected ?? '');
        setScore(updated.score != null ? String(updated.score) : '');
      }
    } finally {
      setCorrecting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t('fieldTitle')} htmlFor="title">
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('fieldTitlePlaceholder')}
          className={inputClass}
        />
      </Field>

      <Field label={t('fieldLink')} htmlFor="link">
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
        <Field label={t('fieldReadingTime')} htmlFor="readingTime">
          <input
            id="readingTime"
            type="number"
            min="1"
            required
            value={readingTime}
            onChange={(e) => setReadingTime(e.target.value)}
            placeholder={t('fieldReadingTimePlaceholder')}
            className={inputClass}
          />
        </Field>
        <Field label={t('fieldTimeRead')} htmlFor="timeRead">
          <input
            id="timeRead"
            type="number"
            min="1"
            value={timeRead}
            onChange={(e) => setTimeRead(e.target.value)}
            placeholder={t('fieldOptional')}
            className={inputClass}
          />
        </Field>
        <Field label={t('fieldTimeWrite')} htmlFor="timeWrite">
          <input
            id="timeWrite"
            type="number"
            min="1"
            value={timeWrite}
            onChange={(e) => setTimeWrite(e.target.value)}
            placeholder={t('fieldOptional')}
            className={inputClass}
          />
        </Field>
        <Field label={t('fieldScore')} htmlFor="score">
          <input
            id="score"
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder={t('fieldOptional')}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label={t('fieldSummary')} htmlFor="summary">
        <textarea
          id="summary"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder={t('fieldOptional')}
          className={inputClass}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="summaryCorrected"
            className="text-sm font-medium text-fg-soft"
          >
            {t('fieldSummaryCorrected')}
          </label>
          {initial && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleCorrect()}
              disabled={!canCorrect || correcting}
              className="px-2.5 py-1 text-xs"
            >
              {correcting ? t('correcting') : t('correctWithAi')}
            </Button>
          )}
        </div>
        <textarea
          id="summaryCorrected"
          rows={3}
          value={summaryCorrected}
          onChange={(e) => setSummaryCorrected(e.target.value)}
          placeholder={t('summaryCorrectedPlaceholder')}
          className={inputClass}
        />
        {initial && summaryDirty && summary.trim() !== '' && (
          <p className="text-xs text-amber-700">
            {t('summaryDirtyWarning')}
          </p>
        )}
        {summaryCorrected.trim() !== '' && (
          <div className="mt-1">
            <span className="text-xs font-medium text-fg-muted">
              {t('preview')}
            </span>
            <SafeHtml
              html={summaryCorrected}
              className="mt-1 rounded-md border border-edge bg-surface-muted px-3 py-2 text-sm text-fg-soft [&_li]:list-disc [&_p]:mb-2 [&_ul]:my-1 [&_ul]:pl-5"
            />
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          {t('common:cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? t('saving') : initial ? t('common:save') : t('register')}
        </Button>
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-md border border-edge-strong px-3 py-2 text-sm text-fg outline-none transition-colors focus:border-edge-inverse';

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
      <span className="text-sm font-medium text-fg-soft">{label}</span>
      {children}
    </label>
  );
}
