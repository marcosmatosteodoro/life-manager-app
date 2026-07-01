'use client';

import { Button } from '@/components/ui/Button';
import { usePomodoroStore } from '@/hooks/usePomodoroStore';
import { useStopwatchStore } from '@/hooks/useStopwatchStore';

/**
 * Botão de sessão de leitura: inicia (ou retoma) o Pomodoro 25/5 e o cronômetro
 * ao mesmo tempo; enquanto rodando, vira "Pausar" e pausa os dois. Controla os
 * timers globais (os mesmos das páginas /pomodoro e /cronometro).
 */
export function StartReadingButton() {
  const pomodoroRunning = usePomodoroStore((s) => s.running);
  const pomodoroMode = usePomodoroStore((s) => s.mode);
  const setPomodoroMode = usePomodoroStore((s) => s.setMode);
  const startPomodoro = usePomodoroStore((s) => s.start);
  const pausePomodoro = usePomodoroStore((s) => s.pause);

  const stopwatchRunning = useStopwatchStore((s) => s.running);
  const startStopwatch = useStopwatchStore((s) => s.start);
  const pauseStopwatch = useStopwatchStore((s) => s.pause);

  const running = pomodoroRunning || stopwatchRunning;

  function toggle() {
    if (running) {
      pausePomodoro();
      pauseStopwatch();
      return;
    }
    // Garante o modo 25/5 (setMode reinicia; só troca se não estiver nele,
    // para não zerar uma sessão pausada que já está em 25/5).
    if (pomodoroMode !== '25/5') setPomodoroMode('25/5');
    startPomodoro();
    startStopwatch();
  }

  return (
    <Button variant="secondary" onClick={toggle}>
      {running ? 'Pausar' : 'Iniciar'}
    </Button>
  );
}
