'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { Loading } from '@/components/ui/Loading';
import { SafeHtml } from '@/components/ui/SafeHtml';
import { toast } from '@/hooks/useToastStore';
import { ApiError, expenseService } from '@/services/expenseService';
import type { ExpenseAnalysis } from '@/services/expense.types';

const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const firstOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
};

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

// Estilo da prosa renderizada (HTML da IA), igual ao feedback.
const proseClass =
  'text-sm leading-relaxed text-fg-soft [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-fg [&_h4]:mt-3 [&_h4]:font-semibold [&_h4]:text-fg [&_li]:mb-0.5 [&_p]:mb-2 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5';

/** Análise dos gastos por IA: escolhe o período e gera a análise. */
export function ExpenseAnalysisPanel() {
  const { t } = useTranslation(['expenses', 'common']);
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(fmt(new Date()));
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExpenseAnalysis | null>(null);

  async function run() {
    if (from > to) {
      toast.errors([t('expenses:analysis.invalidRange')]);
      return;
    }
    setRunning(true);
    try {
      setResult(await expenseService.analyze(from, to));
    } catch (error) {
      toast.errors(
        error instanceof ApiError ? error.messages : [t('common:unexpectedError')],
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">{t('expenses:analysis.subtitle')}</p>

      <div className="flex flex-wrap items-end gap-3">
        <Field label={t('expenses:analysis.from')} htmlFor="an-from">
          <input
            id="an-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t('expenses:analysis.to')} htmlFor="an-to">
          <input
            id="an-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Button onClick={() => void run()} disabled={running}>
          {running ? t('expenses:analysis.running') : t('expenses:analysis.run')}
        </Button>
      </div>

      {running && <Loading />}

      {!running && result && (
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-edge bg-surface-muted px-4 py-3 text-sm text-fg-muted">
            {t('expenses:analysis.periodTotal', {
              total: money.format(result.total),
              count: result.count,
            })}
          </div>
          <SafeHtml html={result.analysis} className={proseClass} />
          <p className="text-xs text-fg-subtle">{t('expenses:analysis.aiNote')}</p>
        </div>
      )}
    </div>
  );
}
