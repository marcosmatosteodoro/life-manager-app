'use client';

import { useTranslation } from 'react-i18next';
import type { Article, ArticleStatus } from '@/services/article.types';
import { formatDateTime } from '@/utils/date';

// Mapeia o status do artigo para a chave i18n (namespace articles).
const STATUS_KEY: Record<ArticleStatus, string> = {
  READING_IN_PROGRESS: 'statusReadingInProgress',
  SUMMARY_IN_PROGRESS: 'statusSummaryInProgress',
  APPLYING_CORRECTION: 'statusApplyingCorrection',
  COMPLETED: 'statusCompleted',
};

interface TodayStudyBannerProps {
  /** Estudo registrado hoje (createdAt de hoje), ou null se não houver. */
  todayStudy: Article | null;
}

/**
 * Mostra "falta estudar" quando não há estudo de hoje, ou um informativo
 * com o artigo do dia quando há.
 */
export function TodayStudyBanner({ todayStudy }: TodayStudyBannerProps) {
  const { t } = useTranslation('articles');

  if (!todayStudy) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
        <span aria-hidden className="shrink-0 text-xl">
          📚
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {t('todayBanner.missingTitle')}
          </p>
          <p className="text-sm text-amber-700">
            {t('todayBanner.missingDescription')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
      <span aria-hidden className="shrink-0 text-xl">
        ✅
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold break-words">
          {t('todayBanner.todayArticle', { title: todayStudy.title })}
        </p>
        <p className="text-sm text-emerald-700">
          {t('todayBanner.loggedAt', {
            status: t(STATUS_KEY[todayStudy.status]),
            datetime: formatDateTime(todayStudy.createdAt),
          })}
          {todayStudy.timeRead !== null
            ? t('todayBanner.readingSuffix', { min: todayStudy.timeRead })
            : ''}
          {todayStudy.score !== null
            ? t('todayBanner.scoreSuffix', { score: todayStudy.score })
            : ''}
          .
        </p>
      </div>
    </div>
  );
}
