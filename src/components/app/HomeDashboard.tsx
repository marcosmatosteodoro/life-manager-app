'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { articleService } from '@/services/articleService';
import {
  ARTICLE_STATUS_LABELS,
  type Article,
} from '@/services/article.types';
import { applyService } from '@/services/applyService';
import { todoCheckService } from '@/services/todoCheckService';
import type { TodoCheck } from '@/services/todo.types';
import { flashCardGroupService } from '@/services/flashCardGroupService';
import type { FlashCardGroup } from '@/services/flashCardGroup.types';
import { ApiError } from '@/services/http';
import { weightService } from '@/services/weightService';
import type { Weight } from '@/services/weight.types';
import { isToday } from '@/utils/date';

type LoadState = 'loading' | 'loaded' | 'error';

interface DashboardData {
  todayChecks: TodoCheck[];
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
      const [todayChecks, articlesRes, weightsRes, groupsRes, appliesRes] =
        await Promise.all([
          todoCheckService.today(),
          articleService.list(),
          weightService.list(),
          flashCardGroupService.list(),
          applyService.list(),
        ]);
      setData({
        todayChecks,
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
    return <Loading />;
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
  const todosTotal = data.todayChecks.length;
  const todosDone = data.todayChecks.filter((c) => c.checked).length;
  const todosPending = todosTotal - todosDone;

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

  // Ofensiva: dias seguidos com pelo menos um artigo (mín. 0).
  const studyDays = new Set(data.articles.map((a) => localDay(a.createdAt)));
  const streak = studyStreak(studyDays);

  // ----- Pendências de hoje (chamam o usuário à ação) -----
  const tasks: { label: string; href: string }[] = [];
  if (todosPending > 0) {
    tasks.push({
      label: `Conclua seus afazeres de hoje — faltam ${todosPending} de ${todosTotal}`,
      href: '/afazeres',
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
          href="/estudando-ingles"
          title="Ofensiva"
          value={`🔥 ${streak}`}
          hint={`dia${streak === 1 ? '' : 's'} seguido${streak === 1 ? '' : 's'} estudando`}
        />
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
          href="/afazeres"
          title="Afazeres"
          value={`${todosDone}/${todosTotal}`}
          hint="afazeres hoje"
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
  return dayStr(d);
}

/** Data local (YYYY-MM-DD) de uma Date. */
function dayStr(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Data local (YYYY-MM-DD) de um timestamp ISO. */
function localDay(iso: string): string {
  return dayStr(new Date(iso));
}

/**
 * Conta dias seguidos com estudo a partir de hoje (mín. 0). Se hoje ainda não
 * tem estudo mas ontem teve, a ofensiva continua válida (conta a partir de ontem).
 */
function studyStreak(days: Set<string>): number {
  const cursor = new Date();
  if (!days.has(dayStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayStr(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(dayStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
