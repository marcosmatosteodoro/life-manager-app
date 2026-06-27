'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import {
  ApiError,
  flashCardGroupService,
} from '@/services/flashCardGroupService';
import type { FlashCardGroup } from '@/services/flashCardGroup.types';
import { FlashCardGroupAbsorbModal } from './FlashCardGroupAbsorbModal';
import { FlashCardGroupForm } from './FlashCardGroupForm';
import { FlashCardGroupList } from './FlashCardGroupList';

type LoadState = 'loading' | 'loaded' | 'error';

export function FlashCardGroupManager() {
  const router = useRouter();
  const [groups, setGroups] = useState<FlashCardGroup[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FlashCardGroup | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<FlashCardGroup | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // Grupo que vai absorver outro (destino); null = modal fechado.
  const [absorbing, setAbsorbing] = useState<FlashCardGroup | null>(null);
  const [absorbInProgress, setAbsorbInProgress] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const { rows } = await flashCardGroupService.list();
      setGroups(rows);
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

  function openEdit(group: FlashCardGroup) {
    setEditing(group);
    setFormOpen(true);
  }

  function closeForm() {
    if (!submitting) setFormOpen(false);
  }

  function openGroup(group: FlashCardGroup) {
    // Inicia a sessão de estudo (modo Card) do grupo.
    router.push(`/revisar/${group.id}/estudar`);
  }

  async function handleSubmit(input: { name: string }) {
    setSubmitting(true);
    try {
      if (editing) {
        await flashCardGroupService.update(editing.id, input);
        toast.success('Grupo atualizado com sucesso.');
      } else {
        await flashCardGroupService.create(input);
        toast.success('Grupo criado com sucesso.');
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
      await flashCardGroupService.remove(deleting.id);
      toast.success('Grupo excluído com sucesso.');
      setDeleting(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error));
    } finally {
      setDeleteInProgress(false);
    }
  }

  async function confirmAbsorb(sourceId: number) {
    if (!absorbing) return;
    setAbsorbInProgress(true);
    try {
      await flashCardGroupService.absorb(absorbing.id, sourceId);
      toast.success('Lista absorvida com sucesso.');
      setAbsorbing(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error));
    } finally {
      setAbsorbInProgress(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Flashcards
        </h1>
        <Button onClick={openCreate}>Novo grupo</Button>
      </div>

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
          <FlashCardGroupList
            groups={groups}
            onOpen={openGroup}
            onManageTerms={(group) =>
              router.push(`/revisar/${group.id}/termos`)
            }
            onAbsorb={setAbsorbing}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
        )}
      </div>

      <Modal
        open={formOpen}
        title={editing ? 'Editar grupo' : 'Novo grupo'}
        onClose={closeForm}
      >
        <FlashCardGroupForm
          key={editing?.id ?? 'new'}
          initial={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir grupo"
        description={
          deleting
            ? `Tem certeza que deseja excluir "${deleting.name}"? Os flashcards do grupo também serão removidos.`
            : ''
        }
        confirmLabel="Excluir"
        loading={deleteInProgress}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteInProgress) setDeleting(null);
        }}
      />

      <FlashCardGroupAbsorbModal
        key={absorbing?.id ?? 'closed'}
        open={absorbing !== null}
        target={absorbing}
        candidates={groups.filter((group) => group.id !== absorbing?.id)}
        submitting={absorbInProgress}
        onConfirm={(sourceId) => void confirmAbsorb(sourceId)}
        onCancel={() => {
          if (!absorbInProgress) setAbsorbing(null);
        }}
      />
    </section>
  );
}

function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
