'use client';

import { type SVGProps, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToastStore';
import { useStopwatchStore } from '@/hooks/useStopwatchStore';
import { cn } from '@/utils/cn';

export function Stopwatch() {
  const { t } = useTranslation('timers');
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
  const { value, unitKey } = formatElapsed(elapsedMs);
  const unit = t(unitKey);
  // Cópia sempre em minutos inteiros (para colar nos campos de tempo do app).
  const copyMinutes = String(Math.round(elapsedMs / 60000));
  const canCopy = !running && elapsedMs > 0;

  // Estado visual: rodando / pausado / pronto.
  const status = running ? 'running' : elapsedMs > 0 ? 'paused' : 'idle';

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(copyMinutes);
      toast.success(t('copied', { minutes: copyMinutes }));
    } catch {
      toast.error(t('copyFailed'));
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">
        {t('stopwatchTitle')}
      </h1>

      <div className="mt-8 flex flex-col items-center rounded-2xl border border-edge bg-surface p-8 shadow-sm">
        {/* Pílula de status */}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            status === 'running' && 'bg-emerald-50 text-emerald-700',
            status === 'paused' && 'bg-amber-50 text-amber-700',
            status === 'idle' && 'bg-surface-subtle text-fg-muted',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              status === 'running' && 'animate-pulse bg-emerald-500',
              status === 'paused' && 'bg-amber-500',
              status === 'idle' && 'bg-fg-subtle',
            )}
          />
          {status === 'running'
            ? t('statusRunning')
            : status === 'paused'
              ? t('statusPaused')
              : t('statusIdle')}
        </span>

        {/* Tempo */}
        <div className="mt-6 flex flex-col items-center">
          {canCopy ? (
            <button
              type="button"
              onClick={copyValue}
              title={t('copyTitle')}
              className="rounded-xl px-4 py-2 font-mono text-6xl font-semibold tabular-nums tracking-tight text-fg transition-colors hover:bg-surface-subtle"
            >
              {value}
            </button>
          ) : (
            <span className="px-4 py-2 font-mono text-6xl font-semibold tabular-nums tracking-tight text-fg">
              {value}
            </span>
          )}
          <span className="mt-1 text-xs uppercase tracking-wide text-fg-subtle">
            {unit}
          </span>
        </div>

        {/* Controles */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {running ? (
            <>
              <Button variant="primary" onClick={pause}>
                <PauseIcon className="h-4 w-4" />
                {t('stop')}
              </Button>
              <Button variant="secondary" onClick={reset}>
                <ResetIcon className="h-4 w-4" />
                {t('reset')}
              </Button>
            </>
          ) : elapsedMs > 0 ? (
            <>
              <Button variant="primary" onClick={start}>
                <PlayIcon className="h-4 w-4" />
                {t('resume')}
              </Button>
              <Button variant="secondary" onClick={reset}>
                <ResetIcon className="h-4 w-4" />
                {t('reset')}
              </Button>
              <Button variant="ghost" onClick={copyValue}>
                <CopyIcon className="h-4 w-4" />
                {t('copy')}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={start}>
              <PlayIcon className="h-4 w-4" />
              {t('start')}
            </Button>
          )}
        </div>

        {canCopy && (
          <p className="mt-4 text-xs text-fg-subtle">{t('copyHint')}</p>
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
function formatElapsed(ms: number): { value: string; unitKey: string } {
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) {
    return { value: totalSeconds.toFixed(2), unitKey: 'unitSeconds' };
  }
  if (totalSeconds < 3600) {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return { value: `${m}:${pad(s)}`, unitKey: 'unitMinutesSeconds' };
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return { value: `${h}:${pad(m)}`, unitKey: 'unitHoursMinutes' };
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
