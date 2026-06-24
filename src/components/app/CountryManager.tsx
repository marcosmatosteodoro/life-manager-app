'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import { ApiError, countryService } from '@/services/countryService';
import type { Country, CountryInput } from '@/services/country.types';
import { CountryForm } from './CountryForm';
import { CountryList } from './CountryList';

type LoadState = 'loading' | 'loaded' | 'error';

export function CountryManager() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Country | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<Country | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const { rows } = await countryService.list();
      setCountries(rows);
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

  function openEdit(country: Country) {
    setEditing(country);
    setFormOpen(true);
  }

  function closeForm() {
    if (!submitting) setFormOpen(false);
  }

  async function handleSubmit(input: CountryInput) {
    setSubmitting(true);
    try {
      if (editing) {
        await countryService.update(editing.id, input);
        toast.success('País atualizado com sucesso.');
      } else {
        await countryService.create(input);
        toast.success('País criado com sucesso.');
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
      await countryService.remove(deleting.id);
      toast.success('País excluído com sucesso.');
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
          Países
        </h1>
        <Button onClick={openCreate}>Novo país</Button>
      </div>

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
          <CountryList
            countries={countries}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
        )}
      </div>

      <Modal
        open={formOpen}
        title={editing ? 'Editar país' : 'Novo país'}
        onClose={closeForm}
      >
        <CountryForm
          key={editing?.id ?? 'new'}
          initial={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir país"
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
