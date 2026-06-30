'use client';

import { Button } from '@/components/ui/Button';
import type { Diary } from '@/services/diary.types';
import { cn } from '@/utils/cn';
import { formatDate, todayDate } from '@/utils/date';

interface DiaryListProps {
  entries: Diary[];
  onEdit: (entry: Diary) => void;
  onDelete: (entry: Diary) => void;
}

export function DiaryList({ entries, onEdit, onDelete }: DiaryListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
        Nenhum registro ainda.
      </p>
    );
  }

  const today = todayDate();

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => {
        const isToday = entry.day === today;
        return (
          <li
            key={entry.id}
            className={cn(
              'rounded-lg border bg-surface px-4 py-3 transition-colors',
              isToday
                ? 'border-edge-inverse ring-1 ring-fg'
                : 'border-edge',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-fg">
                    {formatDate(entry.day)}
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-surface-inverse px-2 py-0.5 text-xs font-medium text-surface">
                      Hoje
                    </span>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-fg-muted">
                  {entry.description}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" onClick={() => onEdit(entry)}>
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onDelete(entry)}
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
