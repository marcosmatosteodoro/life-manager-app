'use client';

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import type { Problem } from '@/services/problem.types';
import { cn } from '@/utils/cn';

interface ProblemListProps {
  problems: Problem[];
  onEdit: (problem: Problem) => void;
  onDelete: (problem: Problem) => void;
  /** Habilita arraste-para-reordenar (só quando a lista está completa, sem filtro). */
  sortable?: boolean;
  /** Recebe a nova ordem de ids após o arraste. */
  onReorder?: (orderedIds: number[]) => void;
}

// Cor do selo por status.
const STATUS_CLASSES: Record<Problem['status'], string> = {
  pendente: 'bg-amber-100 text-amber-800',
  em_progresso: 'bg-sky-100 text-sky-800',
  concluido: 'bg-emerald-100 text-emerald-800',
};

export function ProblemList({
  problems,
  onEdit,
  onDelete,
  sortable = false,
  onReorder,
}: ProblemListProps) {
  const { t } = useTranslation(['problems', 'common']);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  if (problems.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
        {t('empty')}
      </p>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = problems.findIndex((p) => p.id === active.id);
    const newIndex = problems.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(problems, oldIndex, newIndex);
    onReorder?.(reordered.map((p) => p.id));
  }

  if (!sortable) {
    return (
      <ul className="flex flex-col gap-2">
        {problems.map((problem) => (
          <li key={problem.id}>
            <ProblemRow problem={problem} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={problems.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {problems.map((problem) => (
            <SortableProblemRow
              key={problem.id}
              problem={problem}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/** Envolve a linha com drag & drop. */
function SortableProblemRow({
  problem,
  onEdit,
  onDelete,
}: {
  problem: Problem;
  onEdit: (problem: Problem) => void;
  onDelete: (problem: Problem) => void;
}) {
  const { t } = useTranslation('problems');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: problem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ProblemRow
        problem={problem}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandle={
          <button
            type="button"
            aria-label={t('dragToReorder')}
            className="cursor-grab touch-none text-fg-subtle hover:text-fg active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripIcon className="h-5 w-5" />
          </button>
        }
      />
    </div>
  );
}

function ProblemRow({
  problem,
  onEdit,
  onDelete,
  dragHandle,
}: {
  problem: Problem;
  onEdit: (problem: Problem) => void;
  onDelete: (problem: Problem) => void;
  dragHandle?: ReactNode;
}) {
  const { t } = useTranslation(['problems', 'common']);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-edge bg-surface px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="flex min-w-0 items-start gap-2">
        {dragHandle}
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
    </div>
  );
}

function GripIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}
