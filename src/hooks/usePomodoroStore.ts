import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PomodoroMode = '25/5' | '50/10';
export type PomodoroPhase = 'focus' | 'break';

/** Minutos de foco/pausa por modo. */
export const POMODORO_MODES: Record<
  PomodoroMode,
  { focusMin: number; breakMin: number }
> = {
  '25/5': { focusMin: 25, breakMin: 5 },
  '50/10': { focusMin: 50, breakMin: 10 },
};

/** Duração (ms) da fase atual no modo dado. */
export function phaseDurationMs(
  mode: PomodoroMode,
  phase: PomodoroPhase,
): number {
  const m = POMODORO_MODES[mode];
  return (phase === 'focus' ? m.focusMin : m.breakMin) * 60_000;
}

interface PomodoroState {
  mode: PomodoroMode;
  phase: PomodoroPhase;
  running: boolean;
  /** Epoch ms do início do segmento atual em execução, ou null se parado. */
  startedAt: number | null;
  /** Tempo já decorrido na fase atual (ms), de execuções anteriores. */
  accumulatedMs: number;
  setMode: (mode: PomodoroMode) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  /** Vai para a próxima fase (foco↔pausa), reiniciando a contagem dela. */
  advancePhase: () => void;
}

/**
 * Pomodoro global. O tempo é derivado de timestamps (continua correto ao trocar
 * de rota e **após recarregar a página**): modo, fase e timer são persistidos no
 * localStorage e a contagem é retomada do relógio real.
 *
 * `skipHydration: true` evita mismatch de hidratação no Next: o store nasce no
 * estado padrão (igual ao SSR) e carrega o salvo via `rehydrate()` no `useEffect`
 * do componente.
 */
export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      mode: '25/5',
      phase: 'focus',
      running: false,
      startedAt: null,
      accumulatedMs: 0,

      setMode: (mode) =>
        set({
          mode,
          phase: 'focus',
          running: false,
          startedAt: null,
          accumulatedMs: 0,
        }),

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

      reset: () =>
        set({ phase: 'focus', running: false, startedAt: null, accumulatedMs: 0 }),

      advancePhase: () => {
        const { phase, running } = get();
        set({
          phase: phase === 'focus' ? 'break' : 'focus',
          accumulatedMs: 0,
          startedAt: running ? Date.now() : null,
        });
      },
    }),
    {
      name: 'lm_pomodoro',
      skipHydration: true,
      // Persiste modo, fase e timer para resistir ao reload.
      partialize: (state) => ({
        mode: state.mode,
        phase: state.phase,
        running: state.running,
        startedAt: state.startedAt,
        accumulatedMs: state.accumulatedMs,
      }),
    },
  ),
);
