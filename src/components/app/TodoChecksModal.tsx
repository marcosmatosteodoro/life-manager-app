'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { Loading } from '@/components/ui/Loading';
import { toast } from '@/hooks/useToastStore';
import type { Todo, TodoCheck } from '@/services/todo.types';
import { ApiError, todoCheckService } from '@/services/todoCheckService';
import { todayDate } from '@/utils/date';

type LoadState = 'loading' | 'loaded' | 'error';

/** Lista/edição dos checks de um afazer: marcar, criar por data e remover. */
export function TodoChecksModal({ todo }: { todo: Todo }) {
  const { t } = useTranslation(['todo', 'common']);
  const [checks, setChecks] = useState<TodoCheck[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);
  const [newDate, setNewDate] = useState(todayDate());
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const { rows } = await todoCheckService.list({ todoId: todo.id });
      setChecks(rows);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error, t('common:unexpectedError')));
      setLoadState('error');
    }
  }, [todo.id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(check: TodoCheck, checked: boolean) {
    const previous = checks;
    setChecks((cur) =>
      cur.map((c) => (c.id === check.id ? { ...c, checked } : c)),
    );
    try {
      await todoCheckService.update(check.id, { checked });
    } catch (error) {
      setChecks(previous);
      toast.errors(toMessages(error, t('common:unexpectedError')));
    }
  }

  async function addCheck() {
    if (!newDate || busy) return;
    setBusy(true);
    try {
      await todoCheckService.create({ todoId: todo.id, date: newDate });
      toast.success(t('todo:checksModal.added'));
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setBusy(false);
    }
  }

  async function removeCheck(id: number) {
    try {
      await todoCheckService.remove(id);
      setChecks((cur) => cur.filter((c) => c.id !== id));
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Adicionar um check para uma data (inclusive passada) */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Field label={t('todo:checksModal.addDate')} htmlFor="newDate">
            <input
              id="newDate"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Button type="button" onClick={() => void addCheck()} disabled={busy}>
          {t('todo:checksModal.add')}
        </Button>
      </div>

      {loadState === 'loading' && <Loading className="min-h-0 py-8" />}

      {loadState === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <p className="whitespace-pre-line">{loadError.join('\n')}</p>
          <Button variant="secondary" className="mt-2" onClick={() => void load()}>
            {t('common:retry')}
          </Button>
        </div>
      )}

      {loadState === 'loaded' && checks.length === 0 && (
        <p className="text-sm text-fg-muted">
          {t('todo:checksModal.empty')}
        </p>
      )}

      {loadState === 'loaded' && checks.length > 0 && (
        <ul className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
          {checks.map((check) => (
            <li
              key={check.id}
              className="flex items-center justify-between gap-3 rounded-md border border-edge px-3 py-2"
            >
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={check.checked}
                  onChange={(e) => void toggle(check, e.target.checked)}
                  className="h-4 w-4 rounded border-edge-strong accent-emerald-600"
                />
                <span className="text-sm text-fg tabular-nums">
                  {formatDate(check.date)}
                </span>
              </label>
              <button
                type="button"
                onClick={() => void removeCheck(check.id)}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                {t('todo:checksModal.remove')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** YYYY-MM-DD → DD/MM/YYYY. */
function formatDate(date: string): string {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}

function toMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiError) return error.messages;
  return [fallback];
}
