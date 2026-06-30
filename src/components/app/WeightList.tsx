'use client';

import { Button } from '@/components/ui/Button';
import type { Weight } from '@/services/weight.types';
import { cn } from '@/utils/cn';

interface WeightListProps {
  weights: Weight[];
  /** Id do registro mais recente (recebe destaque). */
  highlightId?: number;
  onEdit: (weight: Weight) => void;
  onDelete: (weight: Weight) => void;
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

export function WeightList({
  weights,
  highlightId,
  onEdit,
  onDelete,
}: WeightListProps) {
  if (weights.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
        Nenhum peso registrado ainda.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {weights.map((weight) => {
        const highlighted = weight.id === highlightId;
        return (
          <li
            key={weight.id}
            className={cn(
              'flex flex-col gap-2 rounded-lg border bg-surface px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4',
              highlighted
                ? 'border-edge-inverse ring-1 ring-fg'
                : 'border-edge',
            )}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-lg font-semibold text-fg">
                {weight.value.toFixed(2)} kg
              </span>
              <span className="text-sm text-fg-muted">
                {formatDate(weight.date)}
                {weight.time ? ` às ${weight.time.slice(0, 5)}` : ''}
              </span>
              {highlighted && (
                <span className="rounded-full bg-surface-inverse px-2 py-0.5 text-xs font-medium text-surface">
                  Mais recente
                </span>
              )}
            </div>

            <div className="flex justify-end gap-1 sm:shrink-0">
              <Button variant="ghost" onClick={() => onEdit(weight)}>
                Editar
              </Button>
              <Button
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onDelete(weight)}
              >
                Excluir
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function formatDate(isoDate: string): string {
  // isoDate é YYYY-MM-DD; formata como DD/MM/YYYY sem deslocar fuso.
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  return dateFormatter.format(parsed);
}
