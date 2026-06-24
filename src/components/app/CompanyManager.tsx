'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
      setLoadError(toMessages(error));
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
        toast.success('Empresa atualizada com sucesso.');
      } else {
        await companyService.create(input);
        toast.success('Empresa criada com sucesso.');
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
      await companyService.remove(deleting.id);
      toast.success('Empresa excluída com sucesso.');
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
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Empresas
        </h1>
        <Button onClick={openCreate} disabled={!hasCountries}>
          Nova empresa
        </Button>
      </div>

      {loadState === 'loaded' && !hasCountries && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Você precisa cadastrar um país antes de criar uma empresa.{' '}
          <Link href="/vagas/paises" className="font-medium underline">
            Criar país
          </Link>
          .
        </div>
      )}

      <div className="mt-6">
        {loadState === 'loading' && (
          <p className="text-sm text-neutral-500">Carregando...</p>
        )}
        {loadState === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="whitespace-pre-line">{loadError.join('\n')}</p>
            <Button variant="secondary" className="mt-3" onClick={() => void load()}>
              Tentar novamente
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
        title={editing ? 'Editar empresa' : 'Nova empresa'}
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
        title="Excluir empresa"
        description={
          deleting
            ? `Tem certeza que deseja excluir "${deleting.name}"? Essa ação não pode ser desfeita.`
            : ''
        }
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
