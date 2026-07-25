'use client';

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Field, inputClass } from '@/components/ui/Field';
import { Loading } from '@/components/ui/Loading';
import { toast } from '@/hooks/useToastStore';
import { ApiError, dogService, dogWeightService } from '@/services/dogService';
import type { Dog, DogWeight } from '@/services/dog.types';

type LoadState = 'loading' | 'loaded' | 'error';

const pad = (n: number) => String(n).padStart(2, '0');
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const monthStart = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
};
const dateFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

/** Peso dos cães: registrar e histórico por cão, com lembrete mensal. */
export function DogWeightManager() {
  const { t } = useTranslation(['dogs', 'common']);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [weights, setWeights] = useState<DogWeight[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [dogId, setDogId] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(today());
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<DogWeight | null>(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const [dogRes, weightRes] = await Promise.all([
        dogService.list(),
        dogWeightService.list(),
      ]);
      setDogs(dogRes.rows);
      setWeights(weightRes.rows);
      setDogId((prev) => prev || (dogRes.rows[0] ? String(dogRes.rows[0].id) : ''));
      setLoadState('loaded');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Cães sem pesagem neste mês (lembrete).
  const missing = useMemo(() => {
    const start = monthStart();
    const weighed = new Set(
      weights.filter((w) => w.date >= start).map((w) => w.dogId),
    );
    return dogs.filter((d) => !weighed.has(d.id));
  }, [dogs, weights]);

  const history = weights.filter((w) => String(w.dogId) === dogId);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!dogId || !value) return;
    setSubmitting(true);
    try {
      await dogWeightService.create({
        dogId: Number(dogId),
        value: Number(value),
        date,
      });
      setValue('');
      setDate(today());
      toast.success(t('dogs:weights.created'));
      await load();
    } catch (error) {
      toast.errors(
        error instanceof ApiError ? error.messages : [t('common:unexpectedError')],
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await dogWeightService.remove(deleting.id);
      setDeleting(null);
      toast.success(t('dogs:weights.deleted'));
      await load();
    } catch (error) {
      toast.errors(
        error instanceof ApiError ? error.messages : [t('common:unexpectedError')],
      );
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {t('dogs:weights.title')}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">{t('dogs:weights.subtitle')}</p>
      </div>

      {loadState === 'loading' && <Loading />}
      {loadState === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {t('common:unexpectedError')}{' '}
          <button type="button" onClick={() => void load()} className="underline">
            {t('common:retry')}
          </button>
        </div>
      )}

      {loadState === 'loaded' && (
        <>
          {missing.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {t('dogs:weights.reminder', {
                names: missing.map((d) => d.name).join(', '),
              })}
            </div>
          )}

          {dogs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
              {t('dogs:weights.noDogs')}
            </p>
          ) : (
            <>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 rounded-lg border border-edge bg-surface p-4"
              >
                <Field label={t('dogs:weights.form.dog')} htmlFor="w-dog">
                  <select
                    id="w-dog"
                    value={dogId}
                    onChange={(e) => setDogId(e.target.value)}
                    className={inputClass}
                  >
                    {dogs.map((dog) => (
                      <option key={dog.id} value={dog.id}>
                        {dog.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('dogs:weights.form.value')} htmlFor="w-value">
                    <input
                      id="w-value"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label={t('dogs:weights.form.date')} htmlFor="w-date">
                    <input
                      id="w-date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Button type="submit" disabled={submitting} className="self-start">
                  {submitting ? t('common:saving') : t('dogs:weights.register')}
                </Button>
              </form>

              <div>
                <h2 className="mb-2 text-lg font-semibold text-fg">
                  {t('dogs:weights.history')}
                </h2>
                {history.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-edge-strong px-4 py-8 text-center text-sm text-fg-muted">
                    {t('dogs:weights.empty')}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {history.map((w) => (
                      <li
                        key={w.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-edge bg-surface px-4 py-2.5"
                      >
                        <span className="text-sm text-fg">
                          <span className="font-medium">{w.value} kg</span>
                          {' · '}
                          {dateFmt.format(new Date(`${w.date}T00:00:00Z`))}
                        </span>
                        <Button
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setDeleting(w)}
                        >
                          {t('common:delete')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title={t('dogs:weights.deleteTitle')}
        description={t('dogs:weights.deleteDescription')}
        confirmLabel={t('common:delete')}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}
