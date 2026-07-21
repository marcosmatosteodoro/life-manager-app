'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import type { Problem } from '@/services/problem.types';
import { cn } from '@/utils/cn';

interface ProblemListProps {
  problems: Problem[];
  onEdit: (problem: Problem) => void;
  onDelete: (problem: Problem) => void;
}

// Cor do selo por status.
const STATUS_CLASSES: Record<Problem['status'], string> = {
  pendente: 'bg-amber-100 text-amber-800',
  em_progresso: 'bg-sky-100 text-sky-800',
  concluido: 'bg-emerald-100 text-emerald-800',
};

export function ProblemList({ problems, onEdit, onDelete }: ProblemListProps) {
  const { t } = useTranslation(['problems', 'common']);

  if (problems.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
        {t('empty')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {problems.map((problem) => (
        <li
          key={problem.id}
          className="flex flex-col gap-3 rounded-lg border border-edge bg-surface px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 truncate font-medium text-fg">
                {problem.title}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                  STATUS_CLASSES[problem.status],
                )}
              >
                {t(`status.${problem.status}`)}
              </span>
            </div>
            {problem.description ? (
              <p className="mt-1 whitespace-pre-line text-sm text-fg-muted">
                {problem.description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-1 self-end sm:self-auto">
            <Button variant="ghost" onClick={() => onEdit(problem)}>
              {t('common:edit')}
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(problem)}
            >
              {t('common:delete')}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
