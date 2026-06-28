import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StopwatchState {
  running: boolean;
  /** Tempo acumulado de execuções anteriores (ms). */
  accumulatedMs: number;
  /** Timestamp (epoch ms) do início do trecho atual, ou null se parado. */
  startedAt: number | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  /** Tempo total decorrido em ms, derivado do relógio real. */
  getElapsedMs: () => number;
}

/**
 * Cronômetro global via zustand. O tempo é calculado a partir de timestamps
 * (accumulatedMs + agora - startedAt), então continua correto ao trocar de rota
 * e também **após recarregar a página**: o estado é persistido no localStorage e
 * a contagem é retomada do relógio real (inclusive o tempo com a aba fechada).
 *
 * `skipHydration: true` evita mismatch de hidratação no Next: o store nasce com
 * o estado padrão (igual ao SSR) e só carrega o salvo via `rehydrate()` chamado
 * no `useEffect` do componente.
 */
export const useStopwatchStore = create<StopwatchState>()(
  persist(
    (set, get) => ({
      running: false,
      accumulatedMs: 0,
      startedAt: null,

      start: () => {
        if (get().running) return;
        set({ running: true, startedAt: Date.now() });
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

      reset: () => set({ running: false, startedAt: null, accumulatedMs: 0 }),

      getElapsedMs: () => {
        const { running, startedAt, accumulatedMs } = get();
        return running && startedAt !== null
          ? accumulatedMs + (Date.now() - startedAt)
          : accumulatedMs;
      },
    }),
    {
      name: 'lm_stopwatch',
      skipHydration: true,
      // Só os campos de tempo; as ações não são serializáveis.
      partialize: (state) => ({
        running: state.running,
        accumulatedMs: state.accumulatedMs,
        startedAt: state.startedAt,
      }),
    },
  ),
);
