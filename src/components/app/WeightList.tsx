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
      <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
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
              'flex items-center justify-between gap-4 rounded-lg border bg-white px-4 py-3 transition-colors',
              highlighted
                ? 'border-neutral-900 ring-1 ring-neutral-900'
                : 'border-neutral-200',
            )}
          >
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-semibold text-neutral-900">
                {weight.value.toFixed(2)} kg
              </span>
              <span className="text-sm text-neutral-500">
                {formatDate(weight.date)}
                {weight.time ? ` às ${weight.time.slice(0, 5)}` : ''}
              </span>
              {highlighted && (
                <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
                  Mais recente
                </span>
              )}
            </div>

            <div className="flex shrink-0 gap-1">
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
