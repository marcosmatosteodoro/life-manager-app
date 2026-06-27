'use client';

import { type SVGProps, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  phaseDurationMs,
  type PomodoroMode,
  usePomodoroStore,
} from '@/hooks/usePomodoroStore';
import { cn } from '@/utils/cn';
import { playBeep, unlockAudio } from '@/utils/sound';

const MODE_OPTIONS: PomodoroMode[] = ['25/5', '50/10'];

export function Pomodoro() {
  const mode = usePomodoroStore((s) => s.mode);
  const phase = usePomodoroStore((s) => s.phase);
  const running = usePomodoroStore((s) => s.running);
  const startedAt = usePomodoroStore((s) => s.startedAt);
  const accumulatedMs = usePomodoroStore((s) => s.accumulatedMs);
  const setMode = usePomodoroStore((s) => s.setMode);
  const start = usePomodoroStore((s) => s.start);
  const pause = usePomodoroStore((s) => s.pause);
  const reset = usePomodoroStore((s) => s.reset);

  const [, setTick] = useState(0);

  // Enquanto roda: re-renderiza e troca de fase quando o tempo zera.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      const s = usePomodoroStore.getState();
      if (!s.running) return;
      const elapsed =
        s.accumulatedMs + (s.startedAt ? Date.now() - s.startedAt : 0);
      if (elapsed >= phaseDurationMs(s.mode, s.phase)) {
        const next = s.phase === 'focus' ? 'break' : 'focus';
        s.advancePhase();
        playBeep(next); // áudio distinto para foco e pausa
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  const elapsedMs =
    accumulatedMs + (running && startedAt !== null ? Date.now() - startedAt : 0);
  const remainingMs = Math.max(0, phaseDurationMs(mode, phase) - elapsedMs);
  const isFocus = phase === 'focus';
  const status = running ? 'running' : elapsedMs > 0 ? 'paused' : 'idle';

  function handleStart() {
    unlockAudio(); // libera o áudio no gesto do usuário
    start();
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        Pomodoro
      </h1>

      <div className="mt-8 flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        {/* Fase atual */}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            isFocus ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              status === 'running' && 'animate-pulse',
              isFocus ? 'bg-rose-500' : 'bg-emerald-500',
            )}
          />
          {isFocus ? 'Foco' : 'Pausa'}
        </span>

        {/* Contagem regressiva */}
        <span className="mt-6 font-mono text-6xl font-semibold tabular-nums tracking-tight text-neutral-900">
          {formatMs(remainingMs)}
        </span>

        {/* Modos (trocar reinicia; bloqueado enquanto roda) */}
        <div className="mt-6 flex gap-2">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              disabled={running}
              aria-pressed={mode === option}
              className={cn(
                'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                mode === option
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100',
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Controles */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {running ? (
            <>
              <Button variant="primary" onClick={pause}>
                <PauseIcon className="h-4 w-4" />
                Pausar
              </Button>
              <Button variant="secondary" onClick={reset}>
                <ResetIcon className="h-4 w-4" />
                Reiniciar
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" onClick={handleStart}>
                <PlayIcon className="h-4 w-4" />
                {elapsedMs > 0 ? 'Continuar' : 'Iniciar'}
              </Button>
              {elapsedMs > 0 && (
                <Button variant="secondary" onClick={reset}>
                  <ResetIcon className="h-4 w-4" />
                  Reiniciar
                </Button>
              )}
            </>
          )}
        </div>

        <p className="mt-4 text-xs text-neutral-400">
          Toca um som ao trocar de foco/pausa. Trocar o modo reinicia o ciclo.
        </p>
      </div>
    </section>
  );
}

function formatMs(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(m)}:${pad(s)}`;
}

function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

function PauseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function ResetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
