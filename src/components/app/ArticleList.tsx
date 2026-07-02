'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { SafeHtml } from '@/components/ui/SafeHtml';
import type { Article, ArticleStatus } from '@/services/article.types';
import { cn } from '@/utils/cn';
import { formatDateTime, isToday } from '@/utils/date';
import { StartReadingButton } from './StartReadingButton';

interface ArticleListProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}

// Cor do selo por status do estudo.
const STATUS_CLASSES: Record<Article['status'], string> = {
  READING_IN_PROGRESS: 'bg-sky-100 text-sky-800',
  SUMMARY_IN_PROGRESS: 'bg-amber-100 text-amber-800',
  APPLYING_CORRECTION: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
};

// Chave de tradução por status (rótulos ficam no namespace articles).
const STATUS_KEYS: Record<ArticleStatus, string> = {
  READING_IN_PROGRESS: 'statusReadingInProgress',
  SUMMARY_IN_PROGRESS: 'statusSummaryInProgress',
  APPLYING_CORRECTION: 'statusApplyingCorrection',
  COMPLETED: 'statusCompleted',
};

export function ArticleList({ articles, onEdit, onDelete }: ArticleListProps) {
  const { t } = useTranslation(['articles', 'common']);

  if (articles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
        {t('empty')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {articles.map((article) => {
        const today = isToday(article.createdAt);
        return (
          <li
            key={article.id}
            className={cn(
              'rounded-lg border bg-surface px-4 py-3 transition-colors',
              today
                ? 'border-emerald-300 ring-1 ring-emerald-300'
                : 'border-edge',
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium break-words text-fg">
                    {article.title}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS_CLASSES[article.status],
                    )}
                  >
                    {t(STATUS_KEYS[article.status])}
                  </span>
                  {today && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                      {t('today')}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-fg-subtle">
                  {formatDateTime(article.createdAt)}
                  {article.link ? (
                    <>
                      {' · '}
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-fg-muted hover:underline"
                      >
                        {t('link')}
                      </a>
                    </>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-fg-muted">
                  {article.timeRead != null
                    ? t('reading', { min: article.timeRead })
                    : t('readingEmpty')}
                  {article.timeWrite != null
                    ? t('writing', { min: article.timeWrite })
                    : ''}
                  {article.score != null
                    ? t('score', { score: article.score })
                    : ''}
                </p>
                {article.summary && (
                  <p className="mt-2 line-clamp-2 text-sm text-fg-muted">
                    {article.summary}
                  </p>
                )}
                {article.summaryCorrected && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-fg-muted">
                      {t('summaryCorrectedLabel')}
                    </span>
                    {/* HTML do corretor — renderizado já sanitizado. */}
                    <SafeHtml
                      html={article.summaryCorrected}
                      className="mt-1 text-sm text-fg-soft [&_li]:list-disc [&_p]:mb-2 [&_ul]:my-1 [&_ul]:pl-5"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-1 sm:shrink-0">
                {article.status === 'READING_IN_PROGRESS' && (
                  <StartReadingButton />
                )}
                <Button variant="ghost" onClick={() => onEdit(article)}>
                  {t('common:edit')}
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onDelete(article)}
                >
                  {t('common:delete')}
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
