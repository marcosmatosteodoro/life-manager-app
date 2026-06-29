'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { toast } from '@/hooks/useToastStore';
import { ApiError, todoCheckService } from '@/services/todoCheckService';
import type { TodoCheck } from '@/services/todo.types';
import { cn } from '@/utils/cn';

type LoadState = 'loading' | 'loaded' | 'error';

export function TodoTodayManager() {
  const [checks, setChecks] = useState<TodoCheck[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const rows = await todoCheckService.today();
      setChecks(rows);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error));
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(check: TodoCheck, checked: boolean) {
    const previous = checks;
    // Atualização otimista.
    setChecks((cur) =>
      cur.map((c) => (c.id === check.id ? { ...c, checked } : c)),
    );
    setSavingId(check.id);
    try {
      await todoCheckService.update(check.id, { checked });
    } catch (error) {
      setChecks(previous); // reverte
      toast.errors(toMessages(error));
    } finally {
      setSavingId(null);
    }
  }

  const doneCount = checks.filter((c) => c.checked).length;

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Afazeres
        </h1>
        <Link href="/afazeres/gerenciar">
          <Button variant="secondary">Gerenciar</Button>
        </Link>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        Marque o que você fez hoje.
        {loadState === 'loaded' && checks.length > 0
          ? ` ${doneCount}/${checks.length} concluído${doneCount === 1 ? '' : 's'}.`
          : ''}
      </p>

      <div className="mt-6">
        {loadState === 'loading' && <Loading />}

        {loadState === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="whitespace-pre-line">{loadError.join('\n')}</p>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => void load()}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {loadState === 'loaded' && checks.length === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
            Nenhum afazer para hoje. Crie um em{' '}
            <Link
              href="/afazeres/gerenciar"
              className="font-medium underline"
            >
              Gerenciar
            </Link>
            .
          </p>
        )}

        {loadState === 'loaded' && checks.length > 0 && (
          <ul className="flex flex-col gap-2">
            {checks.map((check) => (
              <li key={check.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-colors',
                    check.checked
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-neutral-200 hover:border-neutral-300',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={check.checked}
                    disabled={savingId === check.id}
                    onChange={(e) => void toggle(check, e.target.checked)}
                    className="h-5 w-5 rounded border-neutral-300 accent-emerald-600"
                  />
                  <div className="min-w-0">
                    <span
                      className={cn(
                        'block truncate font-medium',
                        check.checked
                          ? 'text-emerald-900 line-through'
                          : 'text-neutral-900',
                      )}
                    >
                      {check.todo?.name ?? 'Afazer'}
                    </span>
                    {check.todo?.tag && (
                      <span className="text-xs text-neutral-400">
                        {check.todo.tag}
                      </span>
                    )}
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
