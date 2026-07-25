'use client';

import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Field, inputClass } from '@/components/ui/Field';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import { ApiError, DOG_SEXES, dogService } from '@/services/dogService';
import type { Dog, DogInput, DogSex } from '@/services/dog.types';

type LoadState = 'loading' | 'loaded' | 'error';

/** CRUD dos cães (nome, raça, sexo). */
export function DogManager() {
  const { t } = useTranslation(['dogs', 'common']);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Dog | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<Dog | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const { rows } = await dogService.list();
      setDogs(rows);
      setLoadState('loaded');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(input: DogInput) {
    setSubmitting(true);
    try {
      if (editing) {
        await dogService.update(editing.id, input);
        toast.success(t('dogs:updated'));
      } else {
        await dogService.create(input);
        toast.success(t('dogs:created'));
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
      await dogService.remove(deleting.id);
      toast.success(t('dogs:deleted'));
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
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {t('dogs:title')}
        </h1>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          {t('dogs:new')}
        </Button>
      </div>

      <div className="mt-6">
        {loadState === 'loading' && <Loading />}
        {loadState === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {t('common:unexpectedError')}{' '}
            <button type="button" onClick={() => void load()} className="underline">
              {t('common:retry')}
            </button>
          </div>
        )}
        {loadState === 'loaded' &&
          (dogs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
              {t('dogs:empty')}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {dogs.map((dog) => (
                <li
                  key={dog.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-edge bg-surface px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-fg">{dog.name}</p>
                    <p className="mt-0.5 text-sm text-fg-muted">
                      {dog.breed} · {t(`dogs:sex.${dog.sex}`)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditing(dog);
                        setFormOpen(true);
                      }}
                    >
                      {t('common:edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleting(dog)}
                    >
                      {t('common:delete')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ))}
      </div>

      <Modal
        open={formOpen}
        title={editing ? t('dogs:editTitle') : t('dogs:newTitle')}
        onClose={() => !submitting && setFormOpen(false)}
      >
        <DogForm
          key={editing?.id ?? 'new'}
          initial={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => !submitting && setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={t('dogs:deleteTitle')}
        description={deleting ? t('dogs:deleteDescription', { name: deleting.name }) : ''}
        confirmLabel={t('common:delete')}
        loading={deleteInProgress}
        onConfirm={() => void confirmDelete()}
        onCancel={() => !deleteInProgress && setDeleting(null)}
      />
    </section>
  );
}

function DogForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial: Dog | null;
  submitting: boolean;
  onSubmit: (input: DogInput) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation(['dogs', 'common']);
  const [name, setName] = useState(initial?.name ?? '');
  const [breed, setBreed] = useState(initial?.breed ?? '');
  const [sex, setSex] = useState<DogSex>(initial?.sex ?? 'macho');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ name: name.trim(), breed: breed.trim(), sex });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t('dogs:form.name')} htmlFor="dog-name">
        <input
          id="dog-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('dogs:form.namePlaceholder')}
          className={inputClass}
        />
      </Field>
      <Field label={t('dogs:form.breed')} htmlFor="dog-breed">
        <input
          id="dog-breed"
          type="text"
          required
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder={t('dogs:form.breedPlaceholder')}
          className={inputClass}
        />
      </Field>
      <Field label={t('dogs:form.sex')} htmlFor="dog-sex">
        <select
          id="dog-sex"
          required
          value={sex}
          onChange={(e) => setSex(e.target.value as DogSex)}
          className={inputClass}
        >
          {DOG_SEXES.map((value) => (
            <option key={value} value={value}>
              {t(`dogs:sex.${value}`)}
            </option>
          ))}
        </select>
      </Field>
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          {t('common:cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? t('common:saving') : initial ? t('common:save') : t('dogs:form.create')}
        </Button>
      </div>
    </form>
  );
}

function toMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiError) return error.messages;
  return [fallback];
}
