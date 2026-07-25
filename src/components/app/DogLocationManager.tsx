'use client';

import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Field, inputClass } from '@/components/ui/Field';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import { ApiError, dogWalkLocationService } from '@/services/dogService';
import type {
  DogWalkLocation,
  DogWalkLocationInput,
} from '@/services/dog.types';

type LoadState = 'loading' | 'loaded' | 'error';

/** CRUD dos locais de passeio (título, endereço). */
export function DogLocationManager() {
  const { t } = useTranslation(['dogs', 'common']);
  const [locations, setLocations] = useState<DogWalkLocation[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DogWalkLocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<DogWalkLocation | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const { rows } = await dogWalkLocationService.list();
      setLocations(rows);
      setLoadState('loaded');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(input: DogWalkLocationInput) {
    setSubmitting(true);
    try {
      if (editing) {
        await dogWalkLocationService.update(editing.id, input);
        toast.success(t('dogs:locations.updated'));
      } else {
        await dogWalkLocationService.create(input);
        toast.success(t('dogs:locations.created'));
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
      await dogWalkLocationService.remove(deleting.id);
      toast.success(t('dogs:locations.deleted'));
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
          {t('dogs:locations.title')}
        </h1>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          {t('dogs:locations.new')}
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
          (locations.length === 0 ? (
            <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
              {t('dogs:locations.empty')}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {locations.map((location) => (
                <li
                  key={location.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-edge bg-surface px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-fg">{location.title}</p>
                    <p className="mt-0.5 whitespace-pre-line text-sm text-fg-muted">
                      {location.address}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditing(location);
                        setFormOpen(true);
                      }}
                    >
                      {t('common:edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleting(location)}
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
        title={editing ? t('dogs:locations.editTitle') : t('dogs:locations.newTitle')}
        onClose={() => !submitting && setFormOpen(false)}
      >
        <LocationForm
          key={editing?.id ?? 'new'}
          initial={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => !submitting && setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={t('dogs:locations.deleteTitle')}
        description={
          deleting ? t('dogs:locations.deleteDescription', { name: deleting.title }) : ''
        }
        confirmLabel={t('common:delete')}
        loading={deleteInProgress}
        onConfirm={() => void confirmDelete()}
        onCancel={() => !deleteInProgress && setDeleting(null)}
      />
    </section>
  );
}

function LocationForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial: DogWalkLocation | null;
  submitting: boolean;
  onSubmit: (input: DogWalkLocationInput) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation(['dogs', 'common']);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ title: title.trim(), address: address.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t('dogs:locations.form.title')} htmlFor="loc-title">
        <input
          id="loc-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('dogs:locations.form.titlePlaceholder')}
          className={inputClass}
        />
      </Field>
      <Field label={t('dogs:locations.form.address')} htmlFor="loc-address">
        <textarea
          id="loc-address"
          rows={2}
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('dogs:locations.form.addressPlaceholder')}
          className={inputClass}
        />
      </Field>
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          {t('common:cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? t('common:saving')
            : initial
              ? t('common:save')
              : t('dogs:locations.form.create')}
        </Button>
      </div>
    </form>
  );
}

function toMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiError) return error.messages;
  return [fallback];
}
