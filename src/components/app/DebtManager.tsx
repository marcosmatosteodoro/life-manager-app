'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import { ApiError, debtService } from '@/services/debtService';
import type { Debt, DebtPayment } from '@/services/debt.types';
import { DebtForm } from './DebtForm';
import { DebtPaymentForm } from './DebtPaymentForm';

type LoadState = 'loading' | 'loaded' | 'error';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
const dateFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

/** Tela de dívidas: saldo total + lista com quitação (parcial/total). */
export function DebtManager() {
  const { t } = useTranslation(['debts', 'common']);
  const [rows, setRows] = useState<Debt[]>([]);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [paying, setPaying] = useState<Debt | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Debt | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [removingPayment, setRemovingPayment] = useState<{
    debt: Debt;
    payment: DebtPayment;
  } | null>(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const res = await debtService.list();
      setRows(res.rows);
      setTotalRemaining(res.totalRemaining);
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

  function handlePaid() {
    setPaying(null);
    void load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteInProgress(true);
    try {
      await debtService.remove(deleting.id);
      toast.success(t('debts:deleted'));
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

  async function confirmRemovePayment() {
    if (!removingPayment) return;
    setDeleteInProgress(true);
    try {
      await debtService.removePayment(
        removingPayment.debt.id,
        removingPayment.payment.id,
      );
      toast.success(t('debts:paymentRemoved'));
      setRemovingPayment(null);
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
            {t('debts:title')}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">{t('debts:subtitle')}</p>
        </div>
        <Button className="shrink-0" onClick={openCreate}>
          {t('debts:new')}
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
              {t('debts:totalRemaining')}
            </span>
            <span className="text-xl font-semibold text-fg">
              {money.format(totalRemaining)}
            </span>
          </div>

          {rows.length === 0 ? (
            <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
              {t('debts:empty')}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {rows.map((debt) => {
                const paid = debt.paidAmount ?? 0;
                const pct =
                  debt.totalAmount > 0
                    ? Math.min(100, Math.round((paid / debt.totalAmount) * 100))
                    : 0;
                const expanded = expandedId === debt.id;
                const payments = debt.payments ?? [];
                return (
                  <li
                    key={debt.id}
                    className="rounded-lg border border-edge bg-surface px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="min-w-0 truncate font-medium text-fg">
                            {debt.name}
                          </span>
                          {debt.isSettled && (
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                              {t('debts:settled')}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-fg-muted">
                          {t('debts:remainingOfTotal', {
                            remaining: money.format(debt.remaining ?? 0),
                            total: money.format(debt.totalAmount),
                          })}
                        </p>
                        {debt.description ? (
                          <p className="mt-1 whitespace-pre-line text-sm text-fg-subtle">
                            {debt.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {!debt.isSettled && (
                          <Button onClick={() => setPaying(debt)}>
                            {t('debts:pay')}
                          </Button>
                        )}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditing(debt);
                              setFormOpen(true);
                            }}
                          >
                            {t('common:edit')}
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setDeleting(debt)}
                          >
                            {t('common:delete')}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progresso da quitação */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {payments.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expanded ? null : debt.id)
                        }
                        className="mt-2 text-xs font-medium text-fg-muted underline"
                      >
                        {expanded
                          ? t('debts:hidePayments')
                          : t('debts:showPayments', { count: payments.length })}
                      </button>
                    )}

                    {expanded && (
                      <ul className="mt-2 flex flex-col gap-1 border-t border-edge pt-2">
                        {payments.map((p) => (
                          <li
                            key={p.id}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="text-fg-soft">
                              {money.format(p.value)}
                              <span className="text-fg-muted">
                                {' · '}
                                {dateFmt.format(new Date(`${p.date}T00:00:00Z`))}
                                {p.description ? ` · ${p.description}` : ''}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setRemovingPayment({ debt, payment: p })
                              }
                              className="shrink-0 text-xs text-red-600 underline"
                            >
                              {t('common:delete')}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <Modal
        open={formOpen}
        title={editing ? t('debts:editTitle') : t('debts:newTitle')}
        onClose={() => setFormOpen(false)}
      >
        <DebtForm
          key={editing?.id ?? 'new'}
          initial={editing}
          onSaved={handleSaved}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <Modal
        open={paying !== null}
        title={t('debts:payTitle', { name: paying?.name ?? '' })}
        onClose={() => setPaying(null)}
      >
        {paying && (
          <DebtPaymentForm
            debt={paying}
            onSaved={handlePaid}
            onCancel={() => setPaying(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={t('debts:deleteTitle')}
        description={
          deleting ? t('debts:deleteDescription', { name: deleting.name }) : ''
        }
        confirmLabel={t('common:delete')}
        loading={deleteInProgress}
        onConfirm={() => void confirmDelete()}
        onCancel={() => !deleteInProgress && setDeleting(null)}
      />

      <ConfirmDialog
        open={removingPayment !== null}
        title={t('debts:removePaymentTitle')}
        description={t('debts:removePaymentDescription')}
        confirmLabel={t('common:delete')}
        loading={deleteInProgress}
        onConfirm={() => void confirmRemovePayment()}
        onCancel={() => !deleteInProgress && setRemovingPayment(null)}
      />
    </section>
  );
}
