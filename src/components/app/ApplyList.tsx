'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import type { Apply } from '@/services/apply.types';
import { cn } from '@/utils/cn';

interface ApplyListProps {
  applies: Apply[];
  onEdit: (apply: Apply) => void;
  onDelete: (apply: Apply) => void;
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

// Cor do selo por status.
const STATUS_CLASSES: Record<Apply['status'], string> = {
  APPLIED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  IGNORED: 'bg-surface-subtle text-fg-muted',
  INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-800',
  TECHNICAL_TEST: 'bg-amber-100 text-amber-800',
  AWAITING_RESPONSE: 'bg-sky-100 text-sky-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
};

// Status ainda em andamento — só nesses faz sentido sugerir encerrar.
const OPEN_STATUSES: ReadonlySet<Apply['status']> = new Set([
  'APPLIED',
  'INTERVIEW_SCHEDULED',
  'TECHNICAL_TEST',
  'AWAITING_RESPONSE',
]);

// Candidatura aberta há mais de um mês desde a data de aplicação.
function isStale(apply: Apply): boolean {
  if (!OPEN_STATUSES.has(apply.status)) return false;
  const applied = new Date(`${apply.date}T00:00:00Z`);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return applied < oneMonthAgo;
}

export function ApplyList({ applies, onEdit, onDelete }: ApplyListProps) {
  const { t } = useTranslation(['jobs', 'common']);

  if (applies.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
        {t('jobs:applies.empty')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {applies.map((apply) => (
        <li
          key={apply.id}
          className="flex flex-col gap-3 rounded-lg border border-edge bg-surface px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 truncate font-medium text-fg">
                {apply.name}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                  STATUS_CLASSES[apply.status],
                )}
              >
                {t(`jobs:applyStatus.${apply.status}`)}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-fg-muted">
              {apply.company
                ? apply.company.name
                : t('jobs:applies.companyFallback', { id: apply.companyId })}
              {' · '}
              {formatDate(apply.date)}
              {apply.link ? (
                <>
                  {' · '}
                  <a
                    href={apply.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {t('jobs:applies.link')}
                  </a>
                </>
              ) : null}
            </p>
            {isStale(apply) && (
              <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                {t('jobs:applies.staleWarning')}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1 self-end sm:self-auto">
            <Button variant="ghost" onClick={() => onEdit(apply)}>
              {t('common:edit')}
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(apply)}
            >
              {t('common:delete')}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}
