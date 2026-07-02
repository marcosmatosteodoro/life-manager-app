'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import { ApiError, companyService } from '@/services/companyService';
import type { Company, CompanyInput } from '@/services/company.types';
import { countryService } from '@/services/countryService';
import type { Country } from '@/services/country.types';
import { CompanyForm } from './CompanyForm';
import { CompanyList } from './CompanyList';

type LoadState = 'loading' | 'loaded' | 'error';

export function CompanyManager() {
  const { t } = useTranslation(['jobs', 'common']);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<Company | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const hasCountries = countries.length > 0;

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const [companyRes, countryRes] = await Promise.all([
        companyService.list(),
        countryService.list(),
      ]);
      setCompanies(companyRes.rows);
      setCountries(countryRes.rows);
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

  function openEdit(company: Company) {
    setEditing(company);
    setFormOpen(true);
  }

  function closeForm() {
    if (!submitting) setFormOpen(false);
  }

  async function handleSubmit(input: CompanyInput) {
    setSubmitting(true);
    try {
      if (editing) {
        await companyService.update(editing.id, input);
        toast.success(t('jobs:companies.updated'));
      } else {
        await companyService.create(input);
        toast.success(t('jobs:companies.created'));
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
      await companyService.remove(deleting.id);
      toast.success(t('jobs:companies.deleted'));
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
          {t('jobs:companies.title')}
        </h1>
        <Button onClick={openCreate} disabled={!hasCountries}>
          {t('jobs:companies.new')}
        </Button>
      </div>

      {loadState === 'loaded' && !hasCountries && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('jobs:companies.needCountry')}{' '}
          <Link href="/vagas/paises" className="font-medium underline">
            {t('jobs:companies.createCountry')}
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
          <CompanyList
            companies={companies}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
        )}
      </div>

      <Modal
        open={formOpen}
        title={editing ? t('jobs:companies.editTitle') : t('jobs:companies.newTitle')}
        onClose={closeForm}
      >
        <CompanyForm
          key={editing?.id ?? 'new'}
          initial={editing}
          countries={countries}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={t('jobs:companies.deleteTitle')}
        description={
          deleting
            ? t('jobs:companies.deleteDescription', { name: deleting.name })
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
