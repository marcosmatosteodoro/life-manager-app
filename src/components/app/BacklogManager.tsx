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
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { Loading } from '@/components/ui/Loading';
import { dialog } from '@/hooks/useDialogStore';
import { toast } from '@/hooks/useToastStore';
import { ApiError, backlogService } from '@/services/backlogService';
import type { BacklogItem, BacklogStatus } from '@/services/backlog.types';
import { cn } from '@/utils/cn';
import { BacklogItem as BacklogItemRow } from './BacklogItem';

type LoadState = 'loading' | 'loaded' | 'error';

export function BacklogManager() {
  const { t } = useTranslation(['backlog', 'common']);
  const [status, setStatus] = useState<BacklogStatus>('pendente');
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (s: BacklogStatus) => {
    setLoadState('loading');
    try {
      const { rows } = await backlogService.list(s);
      setItems(rows);
      setLoadState('loaded');
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
      setLoadState('error');
    }
  }, [t]);

  useEffect(() => {
    void load(status);
  }, [load, status]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await backlogService.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      toast.success(t('itemAdded'));
      if (status === 'pendente') await load('pendente');
      else setStatus('pendente'); // novo é pendente: leva pra aba certa
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setCreating(false);
    }
  }

  async function runAndReload(action: Promise<unknown>) {
    try {
      await action;
      await load(status);
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    }
  }

  async function handleDelete(id: number) {
    const ok = await dialog.confirm({
      title: t('common:delete'),
      description: t('confirmDelete'),
      confirmLabel: t('common:delete'),
      tone: 'danger',
    });
    if (!ok) return;
    void runAndReload(backlogService.remove(id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = items;
    const reordered = arrayMove(items, oldIndex, newIndex).map((it, idx) => ({
      ...it,
      position: idx + 1,
    }));
    setItems(reordered); // otimista
    try {
      await backlogService.reorder(reordered.map((i) => i.id));
    } catch (error) {
      setItems(previous); // reverte
      toast.errors(toMessages(error, t('common:unexpectedError')));
    }
  }

  const isPending = status === 'pendente';

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-fg">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          {t('subtitle')}
        </p>
      </div>

      {/* Form de criação */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-lg border border-edge bg-surface p-4"
      >
        <Field label={t('newItemLabel')} htmlFor="backlog-name">
          <input
            id="backlog-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('newItemPlaceholder')}
            className={inputClass}
          />
        </Field>
        <Field label={t('descriptionLabel')} htmlFor="backlog-desc">
          <textarea
            id="backlog-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t('descriptionPlaceholder')}
            className={inputClass}
          />
        </Field>
        <Button type="submit" disabled={creating} className="self-start">
          {creating ? t('adding') : t('common:add')}
        </Button>
      </form>

      {/* Filtro de status */}
      <div className="flex gap-1 self-center rounded-lg border border-edge bg-surface-muted p-1">
        {(['pendente', 'concluido'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            aria-pressed={status === s}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              status === s
                ? 'bg-surface-inverse text-surface'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            {s === 'pendente' ? t('tabPending') : t('tabDone')}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loadState === 'loading' && <Loading />}

      {loadState === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {t('loadError')}{' '}
          <button
            type="button"
            onClick={() => void load(status)}
            className="underline"
          >
            {t('retry')}
          </button>
        </div>
      )}

      {loadState === 'loaded' && items.length === 0 && (
        <p className="rounded-lg border border-dashed border-edge-strong px-4 py-12 text-center text-sm text-fg-muted">
          {isPending ? t('emptyPending') : t('emptyDone')}
        </p>
      )}

      {loadState === 'loaded' && items.length > 0 && isPending && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => void handleDragEnd(e)}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <SortableBacklogItem
                  key={item.id}
                  item={item}
                  onComplete={(id) =>
                    void runAndReload(backlogService.complete(id))
                  }
                  onDelete={handleDelete}
                  onSave={(id, data) =>
                    void runAndReload(backlogService.update(id, data))
                  }
                  onAudioChanged={() => void load(status)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {loadState === 'loaded' && items.length > 0 && !isPending && (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <BacklogItemRow
              key={item.id}
              item={item}
              onReopen={(id) => void runAndReload(backlogService.reopen(id))}
              onDelete={handleDelete}
              onSave={(id, data) =>
                void runAndReload(backlogService.update(id, data))
              }
              onAudioChanged={() => void load(status)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** Envolve a linha com drag & drop (só usado nos pendentes). */
function SortableBacklogItem({
  item,
  onComplete,
  onDelete,
  onSave,
  onAudioChanged,
}: {
  item: BacklogItem;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onSave: (id: number, data: { name: string; description: string }) => void;
  onAudioChanged?: () => void;
}) {
  const { t } = useTranslation('backlog');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const dragLabel = t('dragToReorder');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <BacklogItemRow
        item={item}
        onComplete={onComplete}
        onDelete={onDelete}
        onSave={onSave}
        onAudioChanged={onAudioChanged}
        dragHandle={
          <button
            type="button"
            aria-label={dragLabel}
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

function toMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiError) return error.messages;
  return [fallback];
}
