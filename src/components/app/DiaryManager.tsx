'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import type { Diary, DiaryType } from '@/services/diary.types';
import { ApiError, diaryService } from '@/services/diaryService';
import { todayDate } from '@/utils/date';
import { DiaryForm } from './DiaryForm';
import { DiaryList } from './DiaryList';

type LoadState = 'loading' | 'loaded' | 'error';

interface DiaryManagerProps {
  type: DiaryType;
  title: string;
  /** Mensagem exibida quando ainda não há registro de hoje. */
  todayPendingMessage: string;
  createLabel: string;
}

export function DiaryManager({
  type,
  title,
  todayPendingMessage,
  createLabel,
}: DiaryManagerProps) {
  const [entries, setEntries] = useState<Diary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Diary | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<Diary | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const hasToday = useMemo(
    () => entries.some((e) => e.day === todayDate()),
    [entries],
  );

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const { rows } = await diaryService.list(type);
      setEntries(rows);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error));
      setLoadState('error');
    }
  }, [type]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(entry: Diary) {
    setEditing(entry);
    setFormOpen(true);
  }

  function closeForm() {
    if (!submitting) setFormOpen(false);
  }

  async function handleSubmit(data: { day: string; description: string }) {
    setSubmitting(true);
    try {
      if (editing) {
        await diaryService.update(editing.id, { ...data, type });
        toast.success('Registro atualizado com sucesso.');
      } else {
        await diaryService.create({ ...data, type });
        toast.success('Registro criado com sucesso.');
      }
      setFormOpen(false);
      await load();
    } catch (error) {
      toast.errors(toMessages(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteInProgress(true);
    try {
      await diaryService.remove(deleting.id);
      toast.success('Registro excluído com sucesso.');
      setDeleting(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error));
    } finally {
      setDeleteInProgress(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {title}
        </h1>
        <Button onClick={openCreate}>{createLabel}</Button>
      </div>

      {loadState === 'loaded' && !hasToday && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          <span aria-hidden className="text-xl">
            ✍️
          </span>
          <p className="text-sm font-medium">{todayPendingMessage}</p>
        </div>
      )}

      <div className="mt-6">
        {loadState === 'loading' && <Loading />}
        {loadState === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="whitespace-pre-line">{loadError.join('\n')}</p>
            <Button variant="secondary" className="mt-3" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        )}
        {loadState === 'loaded' && (
          <DiaryList entries={entries} onEdit={openEdit} onDelete={setDeleting} />
        )}
      </div>

      <Modal
        open={formOpen}
        title={editing ? 'Editar registro' : createLabel}
        onClose={closeForm}
      >
        <DiaryForm
          key={editing?.id ?? 'new'}
          initial={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir registro"
        description="Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={deleteInProgress}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteInProgress) setDeleting(null);
        }}
      />
    </section>
  );
}

function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
