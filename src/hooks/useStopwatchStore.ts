import { create } from 'zustand';

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
 * (accumulatedMs + agora - startedAt), então continua correto mesmo quando a
 * página do cronômetro não está montada (troca de rota).
 */
export const useStopwatchStore = create<StopwatchState>((set, get) => ({
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
}));
