'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { inputClass } from '@/components/ui/Field';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import type { Problem, ProblemInput, ProblemStatus } from '@/services/problem.types';
import { ApiError, PROBLEM_STATUSES, problemService } from '@/services/problemService';
import { cn } from '@/utils/cn';
import { ProblemForm } from './ProblemForm';
import { ProblemList } from './ProblemList';

type LoadState = 'loading' | 'loaded' | 'error';
// 'ALL' = todos (padrão). O back devolve ordenado por data (mais recente primeiro).
type StatusFilter = ProblemStatus | 'ALL';

export function ProblemManager() {
  const { t } = useTranslation(['problems', 'common']);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Problem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<Problem | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const filteredProblems =
    statusFilter === 'ALL'
      ? problems
      : problems.filter((problem) => problem.status === statusFilter);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const { rows } = await problemService.list();
      setProblems(rows);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error, t('common:unexpectedError')));
      setLoadState('error');
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(problem: Problem) {
    setEditing(problem);
    setFormOpen(true);
  }

  function closeForm() {
    if (!submitting) setFormOpen(false);
  }

  async function handleSubmit(input: ProblemInput) {
    setSubmitting(true);
    try {
      if (editing) {
        await problemService.update(editing.id, input);
        toast.success(t('updated'));
      } else {
        await problemService.create(input);
        toast.success(t('created'));
      }
      setFormOpen(false);
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setSubmitting(false);
    }
  }

  // Reordena de forma otimista e persiste; em erro, reverte.
  async function handleReorder(orderedIds: number[]) {
    const previous = problems;
    const byId = new Map(problems.map((p) => [p.id, p]));
    const reordered = orderedIds.map((id, index) => ({
      ...byId.get(id)!,
      position: index + 1,
    }));
    setProblems(reordered);
    try {
      await problemService.reorder(orderedIds);
    } catch (error) {
      setProblems(previous);
      toast.errors(toMessages(error, t('common:unexpectedError')));
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteInProgress(true);
    try {
      await problemService.remove(deleting.id);
      toast.success(t('deleted'));
      setDeleting(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setDeleteInProgress(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">{t('subtitle')}</p>
        </div>
        <Button onClick={openCreate}>{t('new')}</Button>
      </div>

      {loadState === 'loaded' && problems.length > 0 && (
        <div className="mt-6 flex items-center gap-2">
          <label htmlFor="problem-filter" className="text-sm text-fg-muted">
            {t('filterStatus')}
          </label>
          <select
            id="problem-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={cn(inputClass, 'max-w-xs')}
          >
            <option value="ALL">{t('filterAll')}</option>
            {PROBLEM_STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(`status.${value}`)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-6">
        {loadState === 'loading' && <Loading />}
        {loadState === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="whitespace-pre-line">{loadError.join('\n')}</p>
            <Button variant="secondary" className="mt-3" onClick={() => void load()}>
              {t('common:retry')}
            </Button>
          </div>
        )}
        {loadState === 'loaded' &&
          (problems.length > 0 && filteredProblems.length === 0 ? (
            <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
              {t('filterEmpty')}
            </p>
          ) : (
            <ProblemList
              problems={filteredProblems}
              onEdit={openEdit}
              onDelete={setDeleting}
              sortable={statusFilter === 'ALL'}
              onReorder={(ids) => void handleReorder(ids)}
            />
          ))}
      </div>

      <Modal
        open={formOpen}
        title={editing ? t('editTitle') : t('newTitle')}
        onClose={closeForm}
      >
        <ProblemForm
          key={editing?.id ?? 'new'}
          initial={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={t('deleteTitle')}
        description={
          deleting ? t('deleteDescription', { title: deleting.title }) : ''
        }
        confirmLabel={t('common:delete')}
        loading={deleteInProgress}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteInProgress) setDeleting(null);
        }}
      />
    </section>
  );
}

function toMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiError) return error.messages;
  return [fallback];
}
