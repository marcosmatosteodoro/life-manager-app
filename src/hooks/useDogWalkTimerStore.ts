import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DogWalkTimerState {
  running: boolean;
  /** Tempo ativo acumulado (ms), somando os trechos entre pausas. */
  accumulatedMs: number;
  /** Início do trecho atual (epoch ms) ou null se pausado/ocioso. */
  startedAt: number | null;
  /** Momento (ISO) em que o passeio começou; null se não há passeio ativo. */
  startedAtISO: string | null;
  /** Cães e local escolhidos ao iniciar o passeio. */
  dogIds: number[];
  locationId: number | null;

  /** Inicia (ou retoma) o passeio; captura seleção só no 1º start. */
  start: (dogIds: number[], locationId: number) => void;
  pause: () => void;
  /** Encerra o passeio e limpa tudo. */
  reset: () => void;
  getElapsedMs: () => number;
}

/**
 * Cronômetro do passeio (só no navegador), espelhando o `useStopwatchStore`:
 * tempo derivado de timestamps (sobrevive a reload/troca de rota). Guarda também
 * os cães e o local para criar o passeio no banco ao "Finalizar". Persistido em
 * `lm_dog_walk` com `skipHydration` (rehydrate no componente).
 */
export const useDogWalkTimerStore = create<DogWalkTimerState>()(
  persist(
    (set, get) => ({
      running: false,
      accumulatedMs: 0,
      startedAt: null,
      startedAtISO: null,
      dogIds: [],
      locationId: null,

      start: (dogIds, locationId) => {
        const state = get();
        if (state.running) return;
        // 1º start captura a seleção e o horário de início do passeio.
        const fresh = state.startedAtISO === null;
        set({
          running: true,
          startedAt: Date.now(),
          startedAtISO: fresh ? new Date().toISOString() : state.startedAtISO,
          dogIds: fresh ? dogIds : state.dogIds,
          locationId: fresh ? locationId : state.locationId,
        });
      },

      pause: () => {
        const { running, startedAt, accumulatedMs } = get();
        if (!running || startedAt === null) return;
        set({
          running: false,
          startedAt: null,
          accumulatedMs: accumulatedMs + (Date.now() - startedAt),
        });
      },

      reset: () =>
        set({
          running: false,
          startedAt: null,
          accumulatedMs: 0,
          startedAtISO: null,
          dogIds: [],
          locationId: null,
        }),

      getElapsedMs: () => {
        const { running, startedAt, accumulatedMs } = get();
        return running && startedAt !== null
          ? accumulatedMs + (Date.now() - startedAt)
          : accumulatedMs;
      },
    }),
    {
      name: 'lm_dog_walk',
      skipHydration: true,
      partialize: (state) => ({
        running: state.running,
        accumulatedMs: state.accumulatedMs,
        startedAt: state.startedAt,
        startedAtISO: state.startedAtISO,
        dogIds: state.dogIds,
        locationId: state.locationId,
      }),
    },
  ),
);
