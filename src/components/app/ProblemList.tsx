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
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToastStore';
import type { Problem } from '@/services/problem.types';
import { ApiError, problemService } from '@/services/problemService';
import { cn } from '@/utils/cn';
import { AudioRecorder } from './AudioRecorder';

interface ProblemListProps {
  problems: Problem[];
  onEdit: (problem: Problem) => void;
  onDelete: (problem: Problem) => void;
  /** Habilita arraste-para-reordenar (só quando a lista está completa, sem filtro). */
  sortable?: boolean;
  /** Recebe a nova ordem de ids após o arraste. */
  onReorder?: (orderedIds: number[]) => void;
  /** Recarrega a lista após gravar/excluir a nota de voz (atualiza hasAudio). */
  onAudioChanged?: () => void;
}

// Cor do selo por status.
const STATUS_CLASSES: Record<Problem['status'], string> = {
  pendente: 'bg-amber-100 text-amber-800',
  em_progresso: 'bg-sky-100 text-sky-800',
  concluido: 'bg-emerald-100 text-emerald-800',
};

// Cor do selo por prioridade (paleta distinta da de status).
const PRIORITY_CLASSES: Record<Problem['priority'], string> = {
  baixa: 'bg-slate-100 text-slate-700',
  media: 'bg-blue-100 text-blue-800',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-800',
};

export function ProblemList({
  problems,
  onEdit,
  onDelete,
  sortable = false,
  onReorder,
  onAudioChanged,
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
            <ProblemRow
              problem={problem}
              onEdit={onEdit}
              onDelete={onDelete}
              onAudioChanged={onAudioChanged}
            />
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
              onAudioChanged={onAudioChanged}
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
  onAudioChanged,
}: {
  problem: Problem;
  onEdit: (problem: Problem) => void;
  onDelete: (problem: Problem) => void;
  onAudioChanged?: () => void;
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
        onAudioChanged={onAudioChanged}
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
  onAudioChanged,
  dragHandle,
}: {
  problem: Problem;
  onEdit: (problem: Problem) => void;
  onDelete: (problem: Problem) => void;
  onAudioChanged?: () => void;
  dragHandle?: ReactNode;
}) {
  const { t } = useTranslation(['problems', 'common']);
  const [open, setOpen] = useState(false);
  const hasDescription = Boolean(problem.description?.trim());

  return (
    <div className="rounded-lg border border-edge bg-surface px-4 py-3">
      {/* Linha 1: (handle) título ......... ações */}
      <div className="flex items-start gap-2">
        {dragHandle}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-fg">{problem.title}</p>

          {/* Linha 2: status · prioridade · categoria */}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                STATUS_CLASSES[problem.status],
              )}
            >
              {t(`status.${problem.status}`)}
            </span>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                PRIORITY_CLASSES[problem.priority],
              )}
            >
              {t(`priority.${problem.priority}`)}
            </span>
            {problem.category && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: problem.category.color }}
              >
                {problem.category.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? t('collapseDescription') : t('expandDescription')}
            className="rounded-md p-1 text-fg-subtle transition-colors hover:bg-surface-subtle hover:text-fg-soft"
          >
            <ChevronDownIcon
              className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
            />
          </button>
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

      {/* Colapsável (grid-rows 0fr→1fr): descrição + nota de voz */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-2 flex flex-col gap-2 border-t border-edge pt-2">
            {hasDescription && (
              <p className="whitespace-pre-line text-sm text-fg-muted">
                {problem.description}
              </p>
            )}
            <ProblemAudioSection problem={problem} onChanged={onAudioChanged} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Nota de voz do problema: ouvir (sob demanda), gravar/regravar e excluir. */
function ProblemAudioSection({
  problem,
  onChanged,
}: {
  problem: Problem;
  onChanged?: () => void;
}) {
  const { t } = useTranslation(['backlog', 'common']);
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);

  function errors(error: unknown): string[] {
    return error instanceof ApiError
      ? error.messages
      : [t('common:unexpectedError')];
  }

  async function loadAudio() {
    setLoading(true);
    try {
      const audio = await problemService.getAudio(problem.id);
      setSrc(`data:${audio.mimeType};base64,${audio.data}`);
    } catch (error) {
      toast.errors(errors(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(audio: { data: string; mimeType: string }) {
    setSaving(true);
    try {
      await problemService.setAudio(problem.id, audio);
      toast.success(t('backlog:audio.saved'));
      setRecording(false);
      setSrc(null);
      onChanged?.();
    } catch (error) {
      toast.errors(errors(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(t('backlog:audio.confirmDelete'))) return;
    try {
      await problemService.removeAudio(problem.id);
      toast.success(t('backlog:audio.deleted'));
      setSrc(null);
      onChanged?.();
    } catch (error) {
      toast.errors(errors(error));
    }
  }

  const hasAudio = Boolean(problem.hasAudio);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
        {t('backlog:audio.title')}
      </p>

      {recording || !hasAudio ? (
        <AudioRecorder
          onSave={handleSave}
          saving={saving}
          recordLabel={
            hasAudio ? t('backlog:audio.rerecord') : t('backlog:audio.record')
          }
          onCancel={hasAudio ? () => setRecording(false) : undefined}
        />
      ) : (
        <>
          {src ? (
            <audio controls autoPlay src={src} className="w-full" />
          ) : (
            <Button
              variant="secondary"
              onClick={() => void loadAudio()}
              disabled={loading}
              className="self-start"
            >
              {t('backlog:audio.listen')}
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setRecording(true)}>
              {t('backlog:audio.rerecord')}
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => void handleDelete()}
            >
              {t('backlog:audio.delete')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
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
