'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import { ApiError, fixedExpenseService } from '@/services/fixedExpenseService';
import type { FixedExpense } from '@/services/fixedExpense.types';
import { FixedExpenseForm } from './FixedExpenseForm';

type LoadState = 'loading' | 'loaded' | 'error';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Tela de gastos fixos: total mensal + lista + cadastro/edição via modal. */
export function FixedExpenseManager() {
  const { t } = useTranslation(['fixedExpenses', 'common']);
  const [rows, setRows] = useState<FixedExpense[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FixedExpense | null>(null);
  const [deleting, setDeleting] = useState<FixedExpense | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const res = await fixedExpenseService.list();
      setRows(res.rows);
      setMonthTotal(res.monthTotal);
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
      await fixedExpenseService.remove(deleting.id);
      toast.success(t('fixedExpenses:deleted'));
      setDeleting(null);
      await load();
    } catch (error) {
      toast.errors(
        error instanceof ApiError
          ? error.messages
          : [t('common:unexpectedError')],
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
            {t('fixedExpenses:title')}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            {t('fixedExpenses:subtitle')}
          </p>
        </div>
        <Button className="shrink-0" onClick={openCreate}>
          {t('fixedExpenses:new')}
        </Button>
      </div>

      {loadState === 'loading' && <Loading />}
      {loadState === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {t('common:unexpectedError')}{' '}
          <button
            type="button"
            onClick={() => void load()}
            className="underline"
          >
            {t('common:retry')}
          </button>
        </div>
      )}

      {loadState === 'loaded' && (
        <>
          <div className="flex items-center justify-between rounded-lg border border-edge bg-surface px-4 py-3">
            <span className="text-sm font-medium text-fg-muted">
              {t('fixedExpenses:monthTotal')}
            </span>
            <span className="text-xl font-semibold text-fg">
              {money.format(monthTotal)}
            </span>
          </div>

          {rows.length === 0 ? (
            <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
              {t('fixedExpenses:empty')}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {rows.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-edge bg-surface px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="min-w-0 truncate font-medium text-fg">
                        {item.name}
                      </span>
                      <span className="shrink-0 rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-medium text-fg-muted">
                        {t('fixedExpenses:paymentDay', { day: item.paymentDay })}
                      </span>
                      {item.isVariable && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          {t('fixedExpenses:variable')}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-fg-muted">
                      {money.format(item.value)}
                    </p>
                    {item.description ? (
                      <p className="mt-1 whitespace-pre-line text-sm text-fg-subtle">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditing(item);
                        setFormOpen(true);
                      }}
                    >
                      {t('common:edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleting(item)}
                    >
                      {t('common:delete')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Modal
        open={formOpen}
        title={
          editing ? t('fixedExpenses:editTitle') : t('fixedExpenses:newTitle')
        }
        onClose={() => setFormOpen(false)}
      >
        <FixedExpenseForm
          key={editing?.id ?? 'new'}
          initial={editing}
          onSaved={handleSaved}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={t('fixedExpenses:deleteTitle')}
        description={
          deleting
            ? t('fixedExpenses:deleteDescription', { name: deleting.name })
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
