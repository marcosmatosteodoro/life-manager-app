'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
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
        toast.success('Candidatura atualizada com sucesso.');
      } else {
        await applyService.create(input);
        toast.success('Candidatura criada com sucesso.');
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
      await applyService.remove(deleting.id);
      toast.success('Candidatura excluída com sucesso.');
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
          Candidaturas
        </h1>
        <Button onClick={openCreate} disabled={!hasCompanies}>
          Nova candidatura
        </Button>
      </div>

      {loadState === 'loaded' && !hasCompanies && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Você precisa cadastrar uma empresa antes de criar uma candidatura.{' '}
          <Link href="/vagas/empresas" className="font-medium underline">
            Criar empresa
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
              Tentar novamente
            </Button>
          </div>
        )}
        {loadState === 'loaded' && (
          <ApplyList applies={applies} onEdit={openEdit} onDelete={setDeleting} />
        )}
      </div>

      <Modal
        open={formOpen}
        title={editing ? 'Editar candidatura' : 'Nova candidatura'}
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
        title="Excluir candidatura"
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
