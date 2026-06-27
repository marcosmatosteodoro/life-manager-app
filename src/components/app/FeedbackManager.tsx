'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { SafeHtml } from '@/components/ui/SafeHtml';
import { toast } from '@/hooks/useToastStore';
import {
  FEEDBACK_PERIOD_OPTIONS,
  type Feedback,
  type FeedbackPeriod,
} from '@/services/feedback.types';
import { ApiError, feedbackService } from '@/services/feedbackService';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';

type LoadState = 'loading' | 'loaded' | 'error';

const periodLabel = (p: FeedbackPeriod) =>
  FEEDBACK_PERIOD_OPTIONS.find((o) => o.value === p)?.label ?? p;

// Estilo da prosa renderizada (HTML do feedback).
const proseClass =
  'text-sm leading-relaxed text-neutral-700 [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-neutral-900 [&_li]:mb-0.5 [&_p]:mb-2 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5';

export function FeedbackManager() {
  const [history, setHistory] = useState<Feedback[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [period, setPeriod] = useState<FeedbackPeriod>('30d');
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const { rows } = await feedbackService.list();
      setHistory(rows);
      // Seleciona o mais recente se nada estiver selecionado.
      setSelected((current) => current ?? rows[0] ?? null);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error));
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function generate() {
    setGenerating(true);
    try {
      const created = await feedbackService.generate(period);
      toast.success('Feedback gerado com sucesso.');
      setHistory((prev) => [created, ...prev]);
      setSelected(created);
    } catch (error) {
      toast.errors(toMessages(error));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        Feedback
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Gere uma análise do seu período com base nos seus dados (peso, estudos,
        consistência, revisões, diário e vagas).
      </p>

      {/* Gerador */}
      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Período</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as FeedbackPeriod)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900"
          >
            {FEEDBACK_PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={() => void generate()} disabled={generating}>
          {generating ? 'Gerando…' : 'Gerar feedback'}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {/* Histórico */}
        <aside className="md:col-span-1">
          <h2 className="text-sm font-semibold text-neutral-700">Histórico</h2>

          {loadState === 'loading' && <Loading className="min-h-0 py-8" />}

          {loadState === 'error' && (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <p className="whitespace-pre-line">{loadError.join('\n')}</p>
              <Button
                variant="secondary"
                className="mt-2"
                onClick={() => void load()}
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {loadState === 'loaded' && history.length === 0 && (
            <p className="mt-2 text-sm text-neutral-500">
              Nenhum feedback ainda. Gere o primeiro acima.
            </p>
          )}

          {loadState === 'loaded' && history.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {history.map((f) => {
                const active = selected?.id === f.id;
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(f)}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'w-full rounded-md border px-3 py-2 text-left transition-colors',
                        active
                          ? 'border-neutral-900 bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400',
                      )}
                    >
                      <span className="block text-sm font-medium text-neutral-900">
                        {periodLabel(f.period)}
                      </span>
                      <span className="block text-xs text-neutral-500">
                        {formatDateTime(f.createdAt)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Feedback selecionado */}
        <div className="md:col-span-2">
          {selected ? (
            <article className="rounded-lg border border-neutral-200 bg-white p-5">
              <header className="mb-3 flex flex-wrap items-baseline gap-2 border-b border-neutral-100 pb-3">
                <span className="text-sm font-semibold text-neutral-900">
                  {periodLabel(selected.period)}
                </span>
                <span className="text-xs text-neutral-500">
                  {formatDateTime(selected.createdAt)}
                </span>
              </header>
              <SafeHtml html={selected.response} className={proseClass} />
            </article>
          ) : (
            <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-16 text-center text-sm text-neutral-500">
              Gere um feedback ou selecione um do histórico para visualizar.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
