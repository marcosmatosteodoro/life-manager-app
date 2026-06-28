'use client';

import { type SVGProps, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToastStore';
import { useStopwatchStore } from '@/hooks/useStopwatchStore';
import { cn } from '@/utils/cn';

export function Stopwatch() {
  // Assina os campos que afetam o display, para re-renderizar em qualquer
  // mudança (inclusive reiniciar com o cronômetro parado).
  const running = useStopwatchStore((s) => s.running);
  const accumulatedMs = useStopwatchStore((s) => s.accumulatedMs);
  const startedAt = useStopwatchStore((s) => s.startedAt);
  const start = useStopwatchStore((s) => s.start);
  const pause = useStopwatchStore((s) => s.pause);
  const reset = useStopwatchStore((s) => s.reset);

  // Carrega o estado salvo (localStorage) após montar — resiste ao reload sem
  // causar mismatch de hidratação (o SSR usa o estado padrão).
  useEffect(() => {
    void useStopwatchStore.persist.rehydrate();
  }, []);

  // Força re-render enquanto está rodando para o display "andar".
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, [running]);

  const elapsedMs =
    running && startedAt !== null
      ? accumulatedMs + (Date.now() - startedAt)
      : accumulatedMs;
  // Display adaptativo: segundos < 1min, min:seg < 1h, senão horas:min.
  const { value, unit } = formatElapsed(elapsedMs);
  // Cópia sempre em minutos inteiros (para colar nos campos de tempo do app).
  const copyMinutes = String(Math.round(elapsedMs / 60000));
  const canCopy = !running && elapsedMs > 0;

  // Estado visual: rodando / pausado / pronto.
  const status = running ? 'running' : elapsedMs > 0 ? 'paused' : 'idle';

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(copyMinutes);
      toast.success(`Valor copiado: ${copyMinutes} min`);
    } catch {
      toast.error('Não foi possível copiar o valor.');
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        Cronômetro
      </h1>

      <div className="mt-8 flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        {/* Pílula de status */}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            status === 'running' && 'bg-emerald-50 text-emerald-700',
            status === 'paused' && 'bg-amber-50 text-amber-700',
            status === 'idle' && 'bg-neutral-100 text-neutral-500',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              status === 'running' && 'animate-pulse bg-emerald-500',
              status === 'paused' && 'bg-amber-500',
              status === 'idle' && 'bg-neutral-400',
            )}
          />
          {status === 'running'
            ? 'Em andamento'
            : status === 'paused'
              ? 'Pausado'
              : 'Pronto'}
        </span>

        {/* Tempo */}
        <div className="mt-6 flex flex-col items-center">
          {canCopy ? (
            <button
              type="button"
              onClick={copyValue}
              title="Clique para copiar (em minutos)"
              className="rounded-xl px-4 py-2 font-mono text-6xl font-semibold tabular-nums tracking-tight text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              {value}
            </button>
          ) : (
            <span className="px-4 py-2 font-mono text-6xl font-semibold tabular-nums tracking-tight text-neutral-900">
              {value}
            </span>
          )}
          <span className="mt-1 text-xs uppercase tracking-wide text-neutral-400">
            {unit}
          </span>
        </div>

        {/* Controles */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {running ? (
            <>
              <Button variant="primary" onClick={pause}>
                <PauseIcon className="h-4 w-4" />
                Parar
              </Button>
              <Button variant="secondary" onClick={reset}>
                <ResetIcon className="h-4 w-4" />
                Reiniciar
              </Button>
            </>
          ) : elapsedMs > 0 ? (
            <>
              <Button variant="primary" onClick={start}>
                <PlayIcon className="h-4 w-4" />
                Continuar
              </Button>
              <Button variant="secondary" onClick={reset}>
                <ResetIcon className="h-4 w-4" />
                Reiniciar
              </Button>
              <Button variant="ghost" onClick={copyValue}>
                <CopyIcon className="h-4 w-4" />
                Copiar
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={start}>
              <PlayIcon className="h-4 w-4" />
              Iniciar
            </Button>
          )}
        </div>

        {canCopy && (
          <p className="mt-4 text-xs text-neutral-400">
            Clique no número para copiar (em minutos).
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Formata o tempo decorrido para exibição:
 * - < 1 min: segundos com centésimos (ex.: "45.32");
 * - < 1 h: minutos e segundos (ex.: "2:05");
 * - >= 1 h: horas e minutos (ex.: "1:23").
 */
function formatElapsed(ms: number): { value: string; unit: string } {
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) {
    return { value: totalSeconds.toFixed(2), unit: 'segundos' };
  }
  if (totalSeconds < 3600) {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return { value: `${m}:${pad(s)}`, unit: 'minutos : segundos' };
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return { value: `${h}:${pad(m)}`, unit: 'horas : minutos' };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
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

function CopyIcon(props: SVGProps<SVGSVGElement>) {
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
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}
