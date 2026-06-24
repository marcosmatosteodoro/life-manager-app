'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToastStore';
import type { FlashCard } from '@/services/flashCard.types';
import { ApiError, flashCardService } from '@/services/flashCardService';
import { flashCardGroupService } from '@/services/flashCardGroupService';
import { cn } from '@/utils/cn';

type LoadState = 'loading' | 'loaded' | 'error';

export function FlashCardStudy({ groupId }: { groupId: number }) {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const [index, setIndex] = useState(0);
  const [showValue, setShowValue] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const rows = await flashCardGroupService.review(groupId);
      setCards(rows);
      setIndex(0);
      setShowValue(false);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error));
      setLoadState('error');
    }
  }, [groupId]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = cards[index];
  const finished = loadState === 'loaded' && index >= cards.length;

  async function answer(correct: boolean) {
    if (!current || saving) return;
    setSaving(true);
    try {
      await flashCardService.review(current.id, correct);
      // Próxima palavra.
      setShowValue(false);
      setIndex((i) => i + 1);
    } catch (error) {
      toast.errors(toMessages(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col">
      {/* Topo: progresso + voltar */}
      <div className="flex items-center justify-between">
        <Link
          href="/revisar"
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          ← Voltar
        </Link>
        {loadState === 'loaded' && cards.length > 0 && !finished && (
          <span className="text-sm font-medium text-neutral-500">
            {index + 1} / {cards.length}
          </span>
        )}
      </div>

      <div className="mt-6">
        {loadState === 'loading' && (
          <p className="text-sm text-neutral-500">Carregando...</p>
        )}

        {loadState === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="whitespace-pre-line">{loadError.join('\n')}</p>
            <Button variant="secondary" className="mt-3" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {loadState === 'loaded' && cards.length === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-16 text-center text-sm text-neutral-500">
            Nenhum card para estudar neste grupo.
          </p>
        )}

        {loadState === 'loaded' && finished && cards.length > 0 && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-16 text-center">
            <span aria-hidden className="text-4xl">
              🎉
            </span>
            <p className="text-lg font-semibold text-emerald-800">
              Estudo concluído!
            </p>
            <div className="flex gap-2">
              <Button onClick={() => void load()}>Estudar novamente</Button>
              <Link href="/revisar">
                <Button variant="secondary">Voltar aos grupos</Button>
              </Link>
            </div>
          </div>
        )}

        {loadState === 'loaded' && current && !finished && (
          <div className="flex flex-col items-center gap-6">
            {/* Card grande, clicável para virar */}
            <button
              type="button"
              onClick={() => setShowValue((v) => !v)}
              className="flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition-colors hover:border-neutral-300"
            >
              <span className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
                {showValue ? 'Tradução' : 'Termo'}
              </span>
              <span className="text-3xl font-semibold text-neutral-900">
                {showValue ? (current.value ?? '—') : current.term}
              </span>
              <span className="mt-4 text-xs text-neutral-400">
                Clique para virar
              </span>
            </button>

            {/* Erro (x vermelho) e acerto (v verde) */}
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                aria-label="Errei"
                disabled={saving}
                onClick={() => void answer(false)}
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-200 bg-red-50 text-2xl text-red-600 transition-colors hover:bg-red-100',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                ✗
              </button>
              <button
                type="button"
                aria-label="Acertei"
                disabled={saving}
                onClick={() => void answer(true)}
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-50 text-2xl text-emerald-600 transition-colors hover:bg-emerald-100',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
