'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { inputClass } from '@/components/ui/Field';
import { Loading } from '@/components/ui/Loading';
import { useDogWalkTimerStore } from '@/hooks/useDogWalkTimerStore';
import { toast } from '@/hooks/useToastStore';
import { ApiError, dogWalkService } from '@/services/dogService';
import type { Dog, DogWalk, DogWalkLocation } from '@/services/dog.types';
import { cn } from '@/utils/cn';

type LoadState = 'loading' | 'loaded' | 'error';

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function DogWalkManager() {
  const { t } = useTranslation(['dogs', 'common']);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [locations, setLocations] = useState<DogWalkLocation[]>([]);
  const [walks, setWalks] = useState<DogWalk[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  // Seleção antes de iniciar (quando o passeio ativa, vem do store).
  const [selectedDogIds, setSelectedDogIds] = useState<number[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [finishing, setFinishing] = useState(false);
  const [deleting, setDeleting] = useState<DogWalk | null>(null);

  const running = useDogWalkTimerStore((s) => s.running);
  const startedAtISO = useDogWalkTimerStore((s) => s.startedAtISO);
  const storeDogIds = useDogWalkTimerStore((s) => s.dogIds);
  const storeLocationId = useDogWalkTimerStore((s) => s.locationId);
  const start = useDogWalkTimerStore((s) => s.start);
  const pause = useDogWalkTimerStore((s) => s.pause);
  const resetTimer = useDogWalkTimerStore((s) => s.reset);
  const getElapsedMs = useDogWalkTimerStore((s) => s.getElapsedMs);

  const active = startedAtISO !== null;
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const page = await dogWalkService.page();
      setDogs(page.dogs);
      setLocations(page.locations);
      setWalks(page.walks);
      setLoadState('loaded');
    } catch {
      setLoadState('error');
    }
  }, []);

  // Carrega o cronômetro salvo (passeio em andamento sobrevive a reload).
  useEffect(() => {
    void useDogWalkTimerStore.persist.rehydrate();
    void load();
  }, [load]);

  // Atualiza o mostrador a cada segundo enquanto roda.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  function toggleDog(id: number) {
    setSelectedDogIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  }

  function handleStart() {
    if (selectedDogIds.length === 0 || !selectedLocationId) return;
    start(selectedDogIds, Number(selectedLocationId));
  }

  async function handleFinish() {
    if (!startedAtISO || storeLocationId == null || storeDogIds.length === 0) {
      return;
    }
    setFinishing(true);
    try {
      await dogWalkService.create({
        dogIds: storeDogIds,
        locationId: storeLocationId,
        startedAt: startedAtISO,
        endedAt: new Date().toISOString(),
        durationSeconds: Math.round(getElapsedMs() / 1000),
      });
      resetTimer();
      setSelectedDogIds([]);
      setSelectedLocationId('');
      toast.success(t('dogs:walks.finished'));
      await load();
    } catch (error) {
      toast.errors(
        error instanceof ApiError ? error.messages : [t('common:unexpectedError')],
      );
    } finally {
      setFinishing(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await dogWalkService.remove(deleting.id);
      setDeleting(null);
      toast.success(t('dogs:walks.deleted'));
      await load();
    } catch (error) {
      toast.errors(
        error instanceof ApiError ? error.messages : [t('common:unexpectedError')],
      );
    }
  }

  const activeDogNames = storeDogIds
    .map((id) => dogs.find((d) => d.id === id)?.name)
    .filter(Boolean)
    .join(', ');
  const activeLocation = locations.find((l) => l.id === storeLocationId);
  const canStart = selectedDogIds.length > 0 && selectedLocationId !== '';

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {t('dogs:walks.title')}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">{t('dogs:walks.subtitle')}</p>
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
          {/* Cronômetro do passeio */}
          <div className="flex flex-col gap-4 rounded-lg border border-edge bg-surface p-4">
            {!active ? (
              <>
                <div>
                  <p className="mb-2 text-sm font-medium text-fg-soft">
                    {t('dogs:walks.pickDogs')}
                  </p>
                  {dogs.length === 0 ? (
                    <p className="text-sm text-fg-muted">{t('dogs:walks.noDogs')}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dogs.map((dog) => (
                        <button
                          key={dog.id}
                          type="button"
                          onClick={() => toggleDog(dog.id)}
                          aria-pressed={selectedDogIds.includes(dog.id)}
                          className={cn(
                            'rounded-full border px-3 py-1 text-sm transition-colors',
                            selectedDogIds.includes(dog.id)
                              ? 'border-edge-inverse bg-surface-inverse text-surface'
                              : 'border-edge text-fg-muted hover:text-fg',
                          )}
                        >
                          {dog.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-fg-soft">
                    {t('dogs:walks.pickLocation')}
                  </span>
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">{t('dogs:walks.selectLocation')}</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.title}
                      </option>
                    ))}
                  </select>
                </label>
                <Button onClick={handleStart} disabled={!canStart} className="self-start">
                  {t('dogs:walks.start')}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-fg-muted">
                  {activeDogNames}
                  {activeLocation ? ` · ${activeLocation.title}` : ''}
                </p>
                <p className="text-center font-mono text-4xl font-semibold tabular-nums text-fg">
                  {formatElapsed(getElapsedMs())}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {running ? (
                    <Button variant="secondary" onClick={pause}>
                      {t('dogs:walks.pause')}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => start(storeDogIds, storeLocationId ?? 0)}
                    >
                      {t('dogs:walks.resume')}
                    </Button>
                  )}
                  <Button onClick={() => void handleFinish()} disabled={finishing}>
                    {finishing ? t('common:saving') : t('dogs:walks.finish')}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Gestão dos passeios */}
          <div>
            <h2 className="mb-2 text-lg font-semibold text-fg">
              {t('dogs:walks.history')}
            </h2>
            {walks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
                {t('dogs:walks.empty')}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {walks.map((walk) => (
                  <li
                    key={walk.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-edge bg-surface px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-fg">
                        {(walk.dogs ?? []).map((d) => d.name).join(', ')}
                      </p>
                      <p className="mt-0.5 text-sm text-fg-muted">
                        {walk.location?.title ?? '—'} ·{' '}
                        {formatDurationSeconds(walk.durationSeconds)} ·{' '}
                        {dateFmt.format(new Date(walk.startedAt))}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleting(walk)}
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

      <ConfirmDialog
        open={deleting !== null}
        title={t('dogs:walks.deleteTitle')}
        description={t('dogs:walks.deleteDescription')}
        confirmLabel={t('common:delete')}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}

/** ms → "mm:ss" (ou "h:mm:ss" acima de 1h). */
function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** segundos → "Xh Ymin" / "Ymin" / "Xs" para a lista. */
function formatDurationSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min`;
  return `${seconds}s`;
}
