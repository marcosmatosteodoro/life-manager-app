'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import {
  ADVICE_STATUSES,
  type AdviceStatus,
  type Apply,
} from '@/services/apply.types';
import { applyService } from '@/services/applyService';
import { cn } from '@/utils/cn';

type LoadState = 'loading' | 'loaded' | 'error';
// Filtro por conselho: todos, sem conselho (NONE) ou um dos 1-4.
type Filter = 'ALL' | 'NONE' | AdviceStatus;

// Cor do selo por conselho (1 pior → 4 melhor).
const ADVICE_CLASSES: Record<AdviceStatus, string> = {
  1: 'bg-red-100 text-red-800',
  2: 'bg-amber-100 text-amber-800',
  3: 'bg-sky-100 text-sky-800',
  4: 'bg-emerald-100 text-emerald-800',
};

/**
 * Conselheiro: relatório das candidaturas por conselho da extensão. O foco é
 * ver o que ela **não soube** avaliar (conselho 2) + os motivos que registrei,
 * para melhorar o algoritmo.
 */
export function ConselheiroManager() {
  const { t } = useTranslation(['jobs', 'common']);
  const [applies, setApplies] = useState<Apply[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  // Começa em "avaliar você mesmo" — o que a extensão não soube.
  const [filter, setFilter] = useState<Filter>(2);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const { rows } = await applyService.list();
      setApplies(rows);
      setLoadState('loaded');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const acc: Record<'NONE' | AdviceStatus, number> = {
      NONE: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };
    for (const a of applies) acc[a.adviceStatus ?? 'NONE'] += 1;
    return acc;
  }, [applies]);

  const filtered = applies.filter((a) => {
    if (filter === 'ALL') return true;
    if (filter === 'NONE') return a.adviceStatus == null;
    return a.adviceStatus === filter;
  });

  const chip = (value: Filter, label: string, count: number) => (
    <button
      key={String(value)}
      type="button"
      onClick={() => setFilter(value)}
      aria-pressed={filter === value}
      className={cn(
        'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
        filter === value
          ? 'border-edge-inverse bg-surface-inverse text-surface'
          : 'border-edge text-fg-muted hover:border-edge-strong hover:text-fg',
      )}
    >
      {label} <span className="opacity-70">({count})</span>
    </button>
  );

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {t('advisor.title')}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">{t('advisor.subtitle')}</p>
      </div>

      {loadState === 'loaded' && applies.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {chip('ALL', t('advisor.filterAll'), applies.length)}
          {ADVICE_STATUSES.map((v) => chip(v, t(`advice.${v}`), counts[v]))}
          {chip('NONE', t('advisor.notAdvised'), counts.NONE)}
        </div>
      )}

      <div className="mt-6">
        {loadState === 'loading' && <Loading />}
        {loadState === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {t('common:unexpectedError')}{' '}
            <button type="button" onClick={() => void load()} className="underline">
              {t('common:retry')}
            </button>
          </div>
        )}
        {loadState === 'loaded' &&
          (filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
              {t('advisor.empty')}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {filtered.map((apply) => (
                <li
                  key={apply.id}
                  className="rounded-lg border border-edge bg-surface px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-fg">{apply.name}</p>
                      <p className="mt-0.5 truncate text-sm text-fg-muted">
                        {apply.company?.name ?? '—'} · {apply.date}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {apply.adviceStatus != null && (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            ADVICE_CLASSES[apply.adviceStatus],
                          )}
                        >
                          {t(`advice.${apply.adviceStatus}`)}
                        </span>
                      )}
                      <span className="rounded-full border border-edge bg-surface-muted px-2 py-0.5 text-xs font-medium text-fg-muted">
                        {apply.isHuman
                          ? t('advisor.human')
                          : t('advisor.robot')}
                      </span>
                    </div>
                  </div>

                  {apply.decisionDescription && (
                    <p className="mt-2 whitespace-pre-line border-t border-edge pt-2 text-sm text-fg-soft">
                      <span className="text-fg-subtle">
                        {t('advisor.reason')}:{' '}
                      </span>
                      {apply.decisionDescription}
                    </p>
                  )}

                  {apply.link && (
                    <a
                      href={apply.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-fg-muted underline hover:text-fg"
                    >
                      {t('advisor.openLink')}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ))}
      </div>
    </section>
  );
}
