'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { articleService } from '@/services/articleService';
import {
  ARTICLE_STATUS_LABELS,
  type Article,
} from '@/services/article.types';
import { applyService } from '@/services/applyService';
import { dailyCheckService } from '@/services/dailyCheckService';
import type { DailyCheck } from '@/services/dailyCheck.types';
import { flashCardGroupService } from '@/services/flashCardGroupService';
import type { FlashCardGroup } from '@/services/flashCardGroup.types';
import { ApiError } from '@/services/http';
import { weightService } from '@/services/weightService';
import type { Weight } from '@/services/weight.types';
import { isToday } from '@/utils/date';
import { DAILY_CHECK_SKILLS } from './dailyCheckSkills';

type LoadState = 'loading' | 'loaded' | 'error';

interface DashboardData {
  today: DailyCheck;
  articles: Article[];
  weights: Weight[];
  groups: FlashCardGroup[];
  appliesCount: number;
}

export function HomeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const [today, articlesRes, weightsRes, groupsRes, appliesRes] =
        await Promise.all([
          dailyCheckService.today(),
          articleService.list(),
          weightService.list(),
          flashCardGroupService.list(),
          applyService.list(),
        ]);
      setData({
        today,
        articles: articlesRes.rows,
        weights: weightsRes.rows,
        groups: groupsRes.rows,
        appliesCount: appliesRes.count,
      });
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error));
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadState === 'loading') {
    return <p className="text-sm text-neutral-500">Carregando...</p>;
  }

  if (loadState === 'error' || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <p className="whitespace-pre-line">{loadError.join('\n')}</p>
        <Button variant="secondary" className="mt-3" onClick={() => void load()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  // ----- Derivados -----
  const habitsTotal = DAILY_CHECK_SKILLS.length;
  const habitsDone = DAILY_CHECK_SKILLS.filter(
    (s) => data.today[s.key],
  ).length;
  const habitsPending = habitsTotal - habitsDone;

  const todayStudy = data.articles.find((a) => isToday(a.createdAt)) ?? null;
  const studyPending = !todayStudy || todayStudy.status !== 'COMPLETED';

  // Peso é semanal: conta como feito se houver registro nesta semana.
  const weekStart = startOfWeek();
  const loggedWeightThisWeek = data.weights.some((w) => w.date >= weekStart);
  const sortedWeights = [...data.weights].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const latestWeight = sortedWeights[sortedWeights.length - 1] ?? null;

  const totalCards = data.groups.reduce(
    (sum, g) => sum + (g.flashCardsCount ?? 0),
    0,
  );

  // ----- Pendências de hoje (chamam o usuário à ação) -----
  const tasks: { label: string; href: string }[] = [];
  if (habitsPending > 0) {
    tasks.push({
      label: `Complete seus hábitos de hoje — faltam ${habitsPending} de ${habitsTotal}`,
      href: '/consistencia',
    });
  }
  if (!loggedWeightThisWeek) {
    tasks.push({
      label: 'Registre o peso desta semana',
      href: '/gerenciamento-de-peso',
    });
  }
  if (studyPending) {
    tasks.push({
      label: todayStudy
        ? 'Termine seu estudo de inglês de hoje'
        : 'Registre seu estudo de inglês de hoje',
      href: '/estudando-ingles',
    });
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      {/* Visão geral */}
      <h2 className="text-sm font-semibold text-neutral-700">Visão geral</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          href="/gerenciamento-de-peso"
          title="Peso atual"
          value={latestWeight ? `${latestWeight.value} kg` : '—'}
          hint={
            loggedWeightThisWeek
              ? 'registrado nesta semana'
              : 'sem registro nesta semana'
          }
        />
        <StatCard
          href="/consistencia"
          title="Consistência"
          value={`${habitsDone}/${habitsTotal}`}
          hint="hábitos hoje"
        />
        <StatCard
          href="/estudando-ingles"
          title="Estudo de hoje"
          value={todayStudy ? ARTICLE_STATUS_LABELS[todayStudy.status] : 'Nenhum'}
          hint={todayStudy ? undefined : 'registre um estudo'}
        />
        <StatCard
          href="/revisar"
          title="Flashcards"
          value={`${totalCards}`}
          hint={`${data.groups.length} grupo${data.groups.length === 1 ? '' : 's'}`}
        />
        <StatCard
          href="/vagas/aplicacoes"
          title="Candidaturas"
          value={`${data.appliesCount}`}
          hint="vagas aplicadas"
        />
      </div>

      {/* Pendências de hoje */}
      <h2 className="mt-8 text-sm font-semibold text-neutral-700">
        Pendências de hoje
      </h2>
      {tasks.length === 0 ? (
        <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Tudo em dia por hoje! 🎉
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
        className="mt-8 flex items-center justify-between gap-3 rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
      >
        <span>Gerar um feedback do seu período</span>
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
      className="flex flex-col rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {title}
      </span>
      <span className="mt-1 truncate text-lg font-semibold text-neutral-900">
        {value}
      </span>
      {hint && <span className="mt-0.5 text-xs text-neutral-500">{hint}</span>}
    </Link>
  );
}

/** Início da semana atual (segunda-feira) no formato YYYY-MM-DD local. */
function startOfWeek(): string {
  const d = new Date();
  const daysSinceMonday = (d.getDay() + 6) % 7; // 0=Dom..6=Sáb → dias após segunda
  d.setDate(d.getDate() - daysSinceMonday);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
