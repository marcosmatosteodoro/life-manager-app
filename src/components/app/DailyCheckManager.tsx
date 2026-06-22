'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToastStore';
import { ApiError, dailyCheckService } from '@/services/dailyCheckService';
import type { DailyCheck, DailyCheckSkill } from '@/services/dailyCheck.types';
import { DailyCheckHistory } from './DailyCheckHistory';
import { TodayChecklist } from './TodayChecklist';

type LoadState = 'loading' | 'loaded' | 'error';

export function DailyCheckManager() {
  const [today, setToday] = useState<DailyCheck | null>(null);
  const [history, setHistory] = useState<DailyCheck[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);
  const [savingKey, setSavingKey] = useState<DailyCheckSkill | null>(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      // Dois endpoints: o de hoje (cria se não existir) e a listagem.
      const [todayCheck, { rows }] = await Promise.all([
        dailyCheckService.today(),
        dailyCheckService.list(),
      ]);
      setToday(todayCheck);
      setHistory(rows);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error));
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // A listagem não mostra o registro de hoje.
  const previousChecks = useMemo(
    () => history.filter((check) => check.id !== today?.id),
    [history, today],
  );

  async function handleToggle(skill: DailyCheckSkill, checked: boolean) {
    if (!today) return;
    const previous = today;
    // Atualização otimista — reflete o check na hora.
    setToday({ ...today, [skill]: checked });
    setSavingKey(skill);
    try {
      const updated = await dailyCheckService.update(today.id, {
        [skill]: checked,
      });
      setToday(updated);
      toast.success('Progresso salvo.');
    } catch (error) {
      // Reverte em caso de falha e mostra o erro do backend.
      setToday(previous);
      toast.errors(toMessages(error));
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        Consistência
      </h1>

      {loadState === 'loading' && (
        <p className="mt-6 text-sm text-neutral-500">Carregando...</p>
      )}

      {loadState === 'error' && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="whitespace-pre-line">{loadError.join('\n')}</p>
          <Button variant="secondary" className="mt-3" onClick={() => void load()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {loadState === 'loaded' && today && (
        <>
          <div className="mt-6">
            <TodayChecklist
              today={today}
              savingKey={savingKey}
              onToggle={(skill, checked) => void handleToggle(skill, checked)}
            />
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Histórico
            </h2>
            <div className="mt-3">
              <DailyCheckHistory checks={previousChecks} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/** Extrai mensagens exibíveis de um erro (ApiError ou genérico). */
function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
