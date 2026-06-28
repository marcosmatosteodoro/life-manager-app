'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePomodoroStore } from '@/hooks/usePomodoroStore';
import { useStopwatchStore } from '@/hooks/useStopwatchStore';
import { cn } from '@/utils/cn';

/**
 * Indicador global (no Header): mostra uma pílula clicável quando o cronômetro
 * e/ou o pomodoro estão rodando, levando para a respectiva página. Sem contagem.
 *
 * Dispara o `rehydrate()` dos stores no mount para que, após um reload em
 * qualquer tela, o estado "rodando" seja conhecido aqui também.
 */
export function RunningTimersIndicator() {
  const stopwatchRunning = useStopwatchStore((s) => s.running);
  const pomodoroRunning = usePomodoroStore((s) => s.running);
  const pomodoroPhase = usePomodoroStore((s) => s.phase);

  useEffect(() => {
    void useStopwatchStore.persist.rehydrate();
    void usePomodoroStore.persist.rehydrate();
  }, []);

  if (!stopwatchRunning && !pomodoroRunning) return null;

  const isFocus = pomodoroPhase === 'focus';

  return (
    <div className="flex items-center gap-1.5">
      {stopwatchRunning && (
        <Pill
          href="/cronometro"
          label="Cronômetro"
          title="Cronômetro em andamento — toque para abrir"
          className="bg-emerald-50 text-emerald-700"
          dotClassName="bg-emerald-500"
        />
      )}
      {pomodoroRunning && (
        <Pill
          href="/pomodoro"
          label={isFocus ? 'Foco' : 'Pausa'}
          title={`Pomodoro em andamento (${isFocus ? 'foco' : 'pausa'}) — toque para abrir`}
          className={
            isFocus
              ? 'bg-rose-50 text-rose-700'
              : 'bg-emerald-50 text-emerald-700'
          }
          dotClassName={isFocus ? 'bg-rose-500' : 'bg-emerald-500'}
        />
      )}
    </div>
  );
}

function Pill({
  href,
  label,
  title,
  className,
  dotClassName,
}: {
  href: string;
  label: string;
  title: string;
  className: string;
  dotClassName: string;
}) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', dotClassName)} />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
