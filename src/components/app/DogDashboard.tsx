'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '@/components/ui/Loading';
import type { DogDashboard as DogDashboardData } from '@/services/dog.types';
import { dogDashboardService } from '@/services/dogService';

type LoadState = 'loading' | 'loaded' | 'error';

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function DogDashboard() {
  const { t } = useTranslation(['dogs', 'common']);
  const [data, setData] = useState<DogDashboardData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      setData(await dogDashboardService.get());
      setLoadState('loaded');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadState === 'loading') return <Loading />;
  if (loadState === 'error' || !data) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {t('common:unexpectedError')}{' '}
        <button type="button" onClick={() => void load()} className="underline">
          {t('common:retry')}
        </button>
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">
        {t('dogs:dashboard.title')}
      </h1>

      {data.needsWeighing && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('dogs:dashboard.needsWeighing')}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat title={t('dogs:dashboard.total')} value={String(data.totalWalks)} />
        <Stat title={t('dogs:dashboard.thisWeek')} value={String(data.walksThisWeek)} />
        <Stat title={t('dogs:dashboard.thisMonth')} value={String(data.walksThisMonth)} />
        <Stat title={t('dogs:dashboard.perWeek')} value={String(data.avgWalksPerWeek)} />
        <Stat
          title={t('dogs:dashboard.avgDuration')}
          value={
            data.avgDurationSeconds != null
              ? `${Math.round(data.avgDurationSeconds / 60)} min`
              : '—'
          }
        />
        <Stat
          title={t('dogs:dashboard.lastWalk')}
          value={data.lastWalkAt ? dateFmt.format(new Date(data.lastWalkAt)) : '—'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CountList title={t('dogs:dashboard.byDog')} rows={data.perDog} empty={t('dogs:dashboard.noData')} />
        <CountList title={t('dogs:dashboard.byLocation')} rows={data.perLocation} empty={t('dogs:dashboard.noData')} />
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-fg">
          {t('dogs:dashboard.weights')}
        </h2>
        <ul className="flex flex-col gap-2">
          {data.dogs.map((dog) => (
            <li
              key={dog.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-edge bg-surface px-4 py-2.5"
            >
              <span className="font-medium text-fg">{dog.name}</span>
              <span className="flex items-center gap-2 text-sm text-fg-muted">
                {dog.latestWeight != null ? `${dog.latestWeight} kg` : t('dogs:dashboard.noWeight')}
                <span
                  className={
                    dog.weighedThisMonth
                      ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800'
                      : 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800'
                  }
                >
                  {dog.weighedThisMonth
                    ? t('dogs:dashboard.weighed')
                    : t('dogs:dashboard.notWeighed')}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-edge bg-surface px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
        {title}
      </p>
      <p className="mt-1 text-xl font-semibold text-fg">{value}</p>
    </div>
  );
}

function CountList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { id: number; label: string; count: number }[];
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-edge bg-surface p-4">
      <p className="mb-2 text-sm font-semibold text-fg">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-fg-muted">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map((row) => (
            <li key={row.id} className="flex justify-between text-sm text-fg-muted">
              <span className="min-w-0 truncate">{row.label}</span>
              <span className="font-medium text-fg">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
