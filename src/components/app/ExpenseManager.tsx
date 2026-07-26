'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import {
  ApiError,
  expenseCategoryService,
  expenseService,
} from '@/services/expenseService';
import type {
  Expense,
  ExpenseCategory,
  ExpenseSummary as ExpenseSummaryData,
} from '@/services/expense.types';
import { ExpenseAnalysisPanel } from './ExpenseAnalysisPanel';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import { ExpenseSummary } from './ExpenseSummary';

type LoadState = 'loading' | 'loaded' | 'error';

/** Tela de gastos: resumo do mês + lista + cadastro/edição via modal. */
export function ExpenseManager() {
  const { t } = useTranslation(['expenses', 'common']);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [summary, setSummary] = useState<ExpenseSummaryData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const [expenseRes, categoryRes, summaryRes] = await Promise.all([
        expenseService.list(),
        expenseCategoryService.list(),
        expenseService.summary(),
      ]);
      setExpenses(expenseRes.rows);
      setCategories(categoryRes.rows);
      setSummary(summaryRes);
      setLoadState('loaded');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleSaved() {
    setFormOpen(false);
    void load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteInProgress(true);
    try {
      await expenseService.remove(deleting.id);
      toast.success(t('expenses:deleted'));
      setDeleting(null);
      await load();
    } catch (error) {
      toast.errors(
        error instanceof ApiError ? error.messages : [t('common:unexpectedError')],
      );
    } finally {
      setDeleteInProgress(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            {t('expenses:title')}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">{t('expenses:subtitle')}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => setAnalysisOpen(true)}>
            {t('expenses:analysis.open')}
          </Button>
          <Button onClick={openCreate}>{t('expenses:new')}</Button>
        </div>
      </div>

      {loadState === 'loading' && <Loading />}
      {loadState === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {t('common:unexpectedError')}{' '}
          <button type="button" onClick={() => void load()} className="underline">
            {t('common:retry')}
          </button>
        </div>
      )}

      {loadState === 'loaded' && (
        <>
          {summary && <ExpenseSummary summary={summary} />}
          <ExpenseList
            expenses={expenses}
            onEdit={(e) => {
              setEditing(e);
              setFormOpen(true);
            }}
            onDelete={setDeleting}
          />
        </>
      )}

      <Modal
        open={formOpen}
        title={editing ? t('expenses:editTitle') : t('expenses:newTitle')}
        onClose={() => setFormOpen(false)}
      >
        <ExpenseForm
          key={editing?.id ?? 'new'}
          initial={editing}
          categories={categories}
          onSaved={handleSaved}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <Modal
        open={analysisOpen}
        title={t('expenses:analysis.title')}
        onClose={() => setAnalysisOpen(false)}
      >
        <ExpenseAnalysisPanel />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={t('expenses:deleteTitle')}
        description={
          deleting
            ? deleting.parcelGroupId && deleting.installments
              ? t('expenses:deleteParcelsDescription', {
                  title: deleting.title,
                  count: deleting.installments,
                })
              : t('expenses:deleteDescription', { title: deleting.title })
            : ''
        }
        confirmLabel={t('common:delete')}
        loading={deleteInProgress}
        onConfirm={() => void confirmDelete()}
        onCancel={() => !deleteInProgress && setDeleting(null)}
      />
    </section>
  );
}
