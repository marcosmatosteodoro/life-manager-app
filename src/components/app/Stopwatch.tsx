'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToastStore';
import { useStopwatchStore } from '@/hooks/useStopwatchStore';

export function Stopwatch() {
  // Assina os campos que afetam o display, para re-renderizar em qualquer
  // mudança (inclusive reiniciar com o cronômetro parado).
  const running = useStopwatchStore((s) => s.running);
  const accumulatedMs = useStopwatchStore((s) => s.accumulatedMs);
  const startedAt = useStopwatchStore((s) => s.startedAt);
  const start = useStopwatchStore((s) => s.start);
  const pause = useStopwatchStore((s) => s.pause);
  const reset = useStopwatchStore((s) => s.reset);

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
  // Float com duas casas decimais (segundos).
  const value = (elapsedMs / 1000).toFixed(2);
  const canCopy = !running && elapsedMs > 0;

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Valor copiado: ${value}`);
    } catch {
      toast.error('Não foi possível copiar o valor.');
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center">
      <h1 className="self-start text-2xl font-semibold tracking-tight text-neutral-900">
        Cronômetro
      </h1>

      <div className="mt-10 flex flex-col items-center gap-2">
        {canCopy ? (
          <button
            type="button"
            onClick={copyValue}
            title="Clique para copiar"
            className="rounded-lg px-4 py-2 font-mono text-6xl font-semibold tabular-nums text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            {value}
          </button>
        ) : (
          <span className="px-4 py-2 font-mono text-6xl font-semibold tabular-nums text-neutral-900">
            {value}
          </span>
        )}
        <span className="text-sm text-neutral-400">segundos</span>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        {running ? (
          <>
            <Button variant="primary" onClick={pause}>
              Parar
            </Button>
            <Button variant="secondary" onClick={reset}>
              Reiniciar
            </Button>
          </>
        ) : elapsedMs > 0 ? (
          <>
            <Button variant="primary" onClick={start}>
              Continuar
            </Button>
            <Button variant="secondary" onClick={reset}>
              Reiniciar
            </Button>
            <Button variant="ghost" onClick={copyValue}>
              Copiar
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={start}>
            Iniciar
          </Button>
        )}
      </div>

      {canCopy && (
        <p className="mt-4 text-xs text-neutral-400">
          Clique no número para copiar.
        </p>
      )}
    </section>
  );
}
