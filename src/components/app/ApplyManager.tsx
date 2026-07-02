'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import type { Apply, ApplyInput } from '@/services/apply.types';
import { ApiError, applyService } from '@/services/applyService';
import { companyService } from '@/services/companyService';
import type { Company } from '@/services/company.types';
import { ApplyForm } from './ApplyForm';
import { ApplyList } from './ApplyList';

type LoadState = 'loading' | 'loaded' | 'error';

export function ApplyManager() {
  const { t } = useTranslation(['jobs', 'common']);
  const [applies, setApplies] = useState<Apply[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Apply | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<Apply | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const hasCompanies = companies.length > 0;

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const [applyRes, companyRes] = await Promise.all([
        applyService.list(),
        companyService.list(),
      ]);
      setApplies(applyRes.rows);
      setCompanies(companyRes.rows);
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

  function openEdit(apply: Apply) {
    setEditing(apply);
    setFormOpen(true);
  }

  function closeForm() {
    if (!submitting) setFormOpen(false);
  }

  async function handleSubmit(input: ApplyInput) {
    setSubmitting(true);
    try {
      if (editing) {
        await applyService.update(editing.id, input);
        toast.success(t('jobs:applies.updated'));
      } else {
        await applyService.create(input);
        toast.success(t('jobs:applies.created'));
      }
      setFormOpen(false);
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteInProgress(true);
    try {
      await applyService.remove(deleting.id);
      toast.success(t('jobs:applies.deleted'));
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
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {t('jobs:applies.title')}
        </h1>
        <Button onClick={openCreate} disabled={!hasCompanies}>
          {t('jobs:applies.new')}
        </Button>
      </div>

      {loadState === 'loaded' && !hasCompanies && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('jobs:applies.needCompany')}{' '}
          <Link href="/vagas/empresas" className="font-medium underline">
            {t('jobs:applies.createCompany')}
          </Link>
          .
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
        {loadState === 'loaded' && (
          <ApplyList applies={applies} onEdit={openEdit} onDelete={setDeleting} />
        )}
      </div>

      <Modal
        open={formOpen}
        title={editing ? t('jobs:applies.editTitle') : t('jobs:applies.newTitle')}
        onClose={closeForm}
      >
        <ApplyForm
          key={editing?.id ?? 'new'}
          initial={editing}
          companies={companies}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={t('jobs:applies.deleteTitle')}
        description={
          deleting
            ? t('jobs:applies.deleteDescription', { name: deleting.name })
            : ''
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
