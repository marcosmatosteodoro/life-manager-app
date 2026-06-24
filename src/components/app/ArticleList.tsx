'use client';

import { Button } from '@/components/ui/Button';
import {
  ARTICLE_STATUS_LABELS,
  type Article,
} from '@/services/article.types';
import { cn } from '@/utils/cn';
import { formatDateTime, isToday } from '@/utils/date';

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

export function ArticleList({ articles, onEdit, onDelete }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
        Nenhum estudo registrado ainda.
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
              'rounded-lg border bg-white px-4 py-3 transition-colors',
              today
                ? 'border-emerald-300 ring-1 ring-emerald-300'
                : 'border-neutral-200',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium text-neutral-900">
                    {article.title}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS_CLASSES[article.status],
                    )}
                  >
                    {ARTICLE_STATUS_LABELS[article.status]}
                  </span>
                  {today && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                      Hoje
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {formatDateTime(article.createdAt)}
                  {article.link ? (
                    <>
                      {' · '}
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-500 hover:underline"
                      >
                        link
                      </a>
                    </>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {article.timeRead != null
                    ? `Leitura: ${article.timeRead} min`
                    : 'Leitura: —'}
                  {article.timeWrite != null
                    ? ` · Escrita: ${article.timeWrite} min`
                    : ''}
                  {article.score != null ? ` · Nota: ${article.score}` : ''}
                </p>
                {article.summary && (
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                    {article.summary}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" onClick={() => onEdit(article)}>
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onDelete(article)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
