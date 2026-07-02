'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { type ArticleStatus } from '@/services/article.types';
import { ApiError, homeService } from '@/services/homeService';
import type { Dashboard } from '@/services/home.types';

type LoadState = 'loading' | 'loaded' | 'error';

/** Mapa status → chave no namespace `articles` (rótulo traduzido). */
const ARTICLE_STATUS_KEYS: Record<ArticleStatus, string> = {
  READING_IN_PROGRESS: 'statusReadingInProgress',
  SUMMARY_IN_PROGRESS: 'statusSummaryInProgress',
  APPLYING_CORRECTION: 'statusApplyingCorrection',
  COMPLETED: 'statusCompleted',
};

export function HomeDashboard() {
  const { t } = useTranslation(['common', 'articles']);
  const [data, setData] = useState<Dashboard | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      // Uma única requisição agregada (GET /home) em vez de várias em paralelo.
      setData(await homeService.get());
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error, t('common:unexpectedError')));
      setLoadState('error');
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadState === 'loading') {
    return <Loading />;
  }

  if (loadState === 'error' || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <p className="whitespace-pre-line">{loadError.join('\n')}</p>
        <Button variant="secondary" className="mt-3" onClick={() => void load()}>
          {t('common:retry')}
        </Button>
      </div>
    );
  }

  // ----- Derivados (dados já processados no back) -----
  const { streak, weight, todos, study, flashcards, appliesCount } = data;
  const todosPending = todos.total - todos.done;
  const studyPending = !study.todayStatus || study.todayStatus !== 'COMPLETED';

  // ----- Pendências de hoje (chamam o usuário à ação) -----
  const tasks: { label: string; href: string }[] = [];
  if (todosPending > 0) {
    tasks.push({
      label: t('taskTodos', { pending: todosPending, total: todos.total }),
      href: '/afazeres',
    });
  }
  if (!weight.loggedThisWeek) {
    tasks.push({ label: t('taskWeight'), href: '/gerenciamento-de-peso' });
  }
  if (studyPending) {
    tasks.push({
      label: study.todayStatus ? t('taskStudyFinish') : t('taskStudyLog'),
      href: '/estudando-ingles',
    });
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      {/* Visão geral */}
      <h2 className="text-sm font-semibold text-fg-soft">{t('overview')}</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          href="/estudando-ingles"
          title={t('streak')}
          value={`🔥 ${streak}`}
          hint={t('streakHint', { count: streak })}
        />
        <StatCard
          href="/gerenciamento-de-peso"
          title={t('currentWeight')}
          value={weight.latest != null ? `${weight.latest} kg` : '—'}
          hint={
            weight.loggedThisWeek
              ? t('weightLoggedThisWeek')
              : t('weightNotLoggedThisWeek')
          }
        />
        <StatCard
          href="/afazeres"
          title={t('todos')}
          value={`${todos.done}/${todos.total}`}
          hint={t('todosToday')}
        />
        <StatCard
          href="/estudando-ingles"
          title={t('todayStudy')}
          value={
            study.todayStatus
              ? t(`articles:${ARTICLE_STATUS_KEYS[study.todayStatus]}`)
              : t('none')
          }
          hint={study.todayStatus ? undefined : t('logAStudy')}
        />
        <StatCard
          href="/revisar"
          title={t('flashcards')}
          value={`${flashcards.totalCards}`}
          hint={t('groupCount', { count: flashcards.groupCount })}
        />
        <StatCard
          href="/vagas/aplicacoes"
          title={t('applications')}
          value={`${appliesCount}`}
          hint={t('jobsApplied')}
        />
      </div>

      {/* Pendências de hoje */}
      <h2 className="mt-8 text-sm font-semibold text-fg-soft">
        {t('pendingToday')}
      </h2>
      {tasks.length === 0 ? (
        <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {t('allDone')}
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {tasks.map((task) => (
            <li key={task.href}>
              <Link
                href={task.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100"
              >
                <span>{task.label}</span>
                <span aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* CTA Feedback */}
      <Link
        href="/feedback"
        className="mt-8 flex items-center justify-between gap-3 rounded-lg bg-surface-inverse px-4 py-3 text-sm font-medium text-surface transition-colors hover:bg-fg-soft"
      >
        <span>{t('ctaFeedback')}</span>
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}

function StatCard({
  href,
  title,
  value,
  hint,
}: {
  href: string;
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-lg border border-edge bg-surface p-4 transition-colors hover:border-edge-strong hover:bg-surface-muted"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
        {title}
      </span>
      <span className="mt-1 truncate text-lg font-semibold text-fg">
        {value}
      </span>
      {hint && <span className="mt-0.5 text-xs text-fg-muted">{hint}</span>}
    </Link>
  );
}

function toMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiError) return error.messages;
  return [fallback];
}
