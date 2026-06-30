'use client';

import { Button } from '@/components/ui/Button';
import type { Apply } from '@/services/apply.types';
import { APPLY_STATUS_LABELS } from '@/services/applyService';
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

export function ApplyList({ applies, onEdit, onDelete }: ApplyListProps) {
  if (applies.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
        Nenhuma candidatura registrada ainda.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {applies.map((apply) => (
        <li
          key={apply.id}
          className="flex items-start justify-between gap-4 rounded-lg border border-edge bg-surface px-4 py-3"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-medium text-fg">
                {apply.name}
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  STATUS_CLASSES[apply.status],
                )}
              >
                {APPLY_STATUS_LABELS[apply.status]}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-fg-muted">
              {apply.company ? apply.company.name : `Empresa #${apply.companyId}`}
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
                    link
                  </a>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" onClick={() => onEdit(apply)}>
              Editar
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(apply)}
            >
              Excluir
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
