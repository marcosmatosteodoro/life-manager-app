'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['flashcards', 'common']);
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
        toast.success(t('groupUpdated'));
      } else {
        await flashCardGroupService.create(input);
        toast.success(t('groupCreated'));
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
      await flashCardGroupService.remove(deleting.id);
      toast.success(t('groupDeleted'));
      setDeleting(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setDeleteInProgress(false);
    }
  }

  async function confirmAbsorb(sourceId: number) {
    if (!absorbing) return;
    setAbsorbInProgress(true);
    try {
      await flashCardGroupService.absorb(absorbing.id, sourceId);
      toast.success(t('listAbsorbed'));
      setAbsorbing(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setAbsorbInProgress(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {t('title')}
        </h1>
        <Button onClick={openCreate}>{t('newGroup')}</Button>
      </div>

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
        title={editing ? t('editGroup') : t('newGroup')}
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
        title={t('deleteGroupTitle')}
        description={
          deleting
            ? t('deleteGroupDescription', { name: deleting.name })
            : ''
        }
        confirmLabel={t('common:delete')}
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

function toMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiError) return error.messages;
  return [fallback];
}
