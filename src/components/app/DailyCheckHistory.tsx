'use client';

import type { DailyCheck } from '@/services/dailyCheck.types';
import { cn } from '@/utils/cn';
import { DAILY_CHECK_SKILLS } from './dailyCheckSkills';

interface DailyCheckHistoryProps {
  /** Checks anteriores (o de hoje já foi removido pelo orquestrador). */
  checks: DailyCheck[];
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

export function DailyCheckHistory({ checks }: DailyCheckHistoryProps) {
  if (checks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
        Nenhum check anterior registrado.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {checks.map((check) => {
        const done = DAILY_CHECK_SKILLS.filter(({ key }) => check[key]).length;
        return (
          <li
            key={check.id}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-900">
                {formatDate(check.date)}
              </span>
              <span className="text-sm text-neutral-500">
                {done}/{DAILY_CHECK_SKILLS.length}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DAILY_CHECK_SKILLS.map(({ key, label }) => (
                <span
                  key={key}
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    check[key]
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-neutral-100 text-neutral-400 line-through',
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}
