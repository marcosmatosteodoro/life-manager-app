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
      <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
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
              'rounded-lg border bg-white px-4 py-3 transition-colors',
              isToday
                ? 'border-neutral-900 ring-1 ring-neutral-900'
                : 'border-neutral-200',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-900">
                    {formatDate(entry.day)}
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
                      Hoje
                    </span>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-neutral-600">
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
