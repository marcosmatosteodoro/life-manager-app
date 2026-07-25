'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { inputClass } from '@/components/ui/Field';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import type {
  Problem,
  ProblemCategory,
  ProblemInput,
  ProblemPriority,
  ProblemStatus,
} from '@/services/problem.types';
import {
  ApiError,
  PROBLEM_PRIORITIES,
  PROBLEM_STATUSES,
  problemCategoryService,
  problemService,
} from '@/services/problemService';
import { cn } from '@/utils/cn';
import { ProblemCategoryManager } from './ProblemCategoryManager';
import { ProblemForm } from './ProblemForm';
import { ProblemList } from './ProblemList';

type LoadState = 'loading' | 'loaded' | 'error';
// 'ALL' = todos (padrão). O back devolve ordenado por position.
type StatusFilter = ProblemStatus | 'ALL';
type PriorityFilter = ProblemPriority | 'ALL';
// 'ALL' = todas; 'NONE' = sem categoria; senão o id (string) da categoria.
type CategoryFilter = 'ALL' | 'NONE' | string;

export function ProblemManager() {
  const { t } = useTranslation(['problems', 'common']);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Problem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<Problem | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const filtersActive =
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    categoryFilter !== 'ALL';

  const filteredProblems = problems.filter((problem) => {
    if (statusFilter !== 'ALL' && problem.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && problem.priority !== priorityFilter) {
      return false;
    }
    if (categoryFilter === 'NONE' && problem.categoryId != null) return false;
    if (
      categoryFilter !== 'ALL' &&
      categoryFilter !== 'NONE' &&
      String(problem.categoryId) !== categoryFilter
    ) {
      return false;
    }
    return true;
  });

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const [problemRes, categoryRes] = await Promise.all([
        problemService.list(),
        problemCategoryService.list(),
      ]);
      setProblems(problemRes.rows);
      setCategories(categoryRes.rows);
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
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => setCategoriesOpen(true)}>
            {t('categories.manage')}
          </Button>
          <Button onClick={openCreate}>{t('new')}</Button>
        </div>
      </div>

      {loadState === 'loaded' && problems.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          <label className="flex w-full items-center gap-2 text-sm text-fg-muted sm:w-auto">
            {t('filterStatus')}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className={cn(inputClass, 'flex-1 sm:w-auto sm:flex-none')}
            >
              <option value="ALL">{t('filterAll')}</option>
              {PROBLEM_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {t(`status.${value}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex w-full items-center gap-2 text-sm text-fg-muted sm:w-auto">
            {t('filterPriority')}
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as PriorityFilter)
              }
              className={cn(inputClass, 'flex-1 sm:w-auto sm:flex-none')}
            >
              <option value="ALL">{t('filterAllF')}</option>
              {PROBLEM_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {t(`priority.${value}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex w-full items-center gap-2 text-sm text-fg-muted sm:w-auto">
            {t('filterCategory')}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={cn(inputClass, 'flex-1 sm:w-auto sm:flex-none')}
            >
              <option value="ALL">{t('filterAllF')}</option>
              <option value="NONE">{t('filterNoCategory')}</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
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
              sortable={!filtersActive}
              onReorder={(ids) => void handleReorder(ids)}
              onAudioChanged={() => void load()}
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
          categories={categories}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <Modal
        open={categoriesOpen}
        title={t('categories.title')}
        onClose={() => setCategoriesOpen(false)}
      >
        <ProblemCategoryManager
          categories={categories}
          onChanged={() => void load()}
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
