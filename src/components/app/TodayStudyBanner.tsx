'use client';

import type { Article } from '@/services/article.types';
import { formatDateTime } from '@/utils/date';

interface TodayStudyBannerProps {
  /** Estudo registrado hoje (createdAt de hoje), ou null se não houver. */
  todayStudy: Article | null;
}

/**
 * Mostra "falta estudar" quando não há estudo de hoje, ou um informativo
 * com o artigo do dia quando há.
 */
export function TodayStudyBanner({ todayStudy }: TodayStudyBannerProps) {
  if (!todayStudy) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
        <span aria-hidden className="text-xl">
          📚
        </span>
        <div>
          <p className="text-sm font-semibold">Falta estudar hoje</p>
          <p className="text-sm text-amber-700">
            Você ainda não registrou um estudo de inglês hoje.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
      <span aria-hidden className="text-xl">
        ✅
      </span>
      <div>
        <p className="text-sm font-semibold">
          Artigo de hoje: {todayStudy.title}
        </p>
        <p className="text-sm text-emerald-700">
          Estudo registrado em {formatDateTime(todayStudy.createdAt)} ·{' '}
          {todayStudy.timeRead} min de leitura
          {todayStudy.score !== null ? ` · nota ${todayStudy.score}` : ''}.
        </p>
      </div>
    </div>
  );
}
