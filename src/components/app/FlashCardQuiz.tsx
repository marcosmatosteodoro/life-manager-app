'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { toast } from '@/hooks/useToastStore';
import { ApiError, flashCardService } from '@/services/flashCardService';
import { flashCardGroupService } from '@/services/flashCardGroupService';
import type { QuizQuestion } from '@/services/flashCardGroup.types';
import { cn } from '@/utils/cn';

type LoadState = 'loading' | 'loaded' | 'error';

/**
 * Modo avaliação: uma pergunta por vez (termo + opções). Ao clicar, a correta
 * fica verde, a errada clicada vermelha e as demais desabilitam; cada resposta
 * é salva na hora (review). As perguntas são carregadas do back uma única vez.
 */
export function FlashCardQuiz({
  groupId,
  onExit,
}: {
  groupId: number;
  onExit?: () => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [hits, setHits] = useState(0);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const rows = await flashCardGroupService.reviewQuiz(groupId);
      // Só perguntas com ao menos 2 opções fazem sentido para o quiz.
      setQuestions(rows.filter((q) => q.options.length >= 2));
      setIndex(0);
      setSelected(null);
      setHits(0);
      setDone(false);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error));
      setLoadState('error');
    }
  }, [groupId]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const answered = selected !== null;

  async function choose(option: string) {
    if (answered || !current) return;
    setSelected(option);
    const correct = option === current.value;
    if (correct) setHits((h) => h + 1);
    try {
      // Salva a cada clique (mesmo review do modo um a um).
      await flashCardService.review(current.id, correct);
    } catch (error) {
      toast.errors(toMessages(error));
    }
  }

  function next() {
    if (isLast) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  if (loadState === 'loading') return <Loading />;

  if (loadState === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <p className="whitespace-pre-line">{loadError.join('\n')}</p>
        <Button variant="secondary" className="mt-3" onClick={() => void load()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-edge-strong px-4 py-16 text-center text-sm text-fg-muted">
        Cadastre ao menos 2 termos com tradução neste grupo para a avaliação.
      </p>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-16 text-center">
        <span aria-hidden className="text-4xl">
          🎉
        </span>
        <p className="text-lg font-semibold text-emerald-800">
          Avaliação concluída!
        </p>
        <p className="text-sm text-emerald-700">
          {hits} de {questions.length} corretas.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => void load()}>Refazer</Button>
          {onExit && (
            <Button variant="secondary" onClick={onExit}>
              Trocar modo
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-sm font-medium text-fg-muted">
        <span>
          {index + 1} / {questions.length}
        </span>
        <span>{hits} acerto{hits === 1 ? '' : 's'}</span>
      </div>

      {/* Termo */}
      <div className="rounded-2xl border border-edge bg-surface p-6 text-center shadow-sm">
        <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-fg-subtle">
          Termo
        </span>
        <span className="text-3xl font-semibold break-words text-fg">
          {current.term}
        </span>
      </div>

      {/* Opções */}
      <div className="grid gap-2">
        {current.options.map((option) => {
          const isCorrect = option === current.value;
          const isChosenWrong = answered && option === selected && !isCorrect;
          const showCorrect = answered && isCorrect;
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => void choose(option)}
              className={cn(
                'w-full rounded-lg border px-4 py-3 text-left text-sm font-medium break-words transition-colors',
                'disabled:cursor-default',
                showCorrect &&
                  'border-emerald-300 bg-emerald-50 text-emerald-800',
                isChosenWrong && 'border-red-300 bg-red-50 text-red-700',
                answered &&
                  !showCorrect &&
                  !isChosenWrong &&
                  'border-edge bg-surface text-fg-subtle opacity-60',
                !answered &&
                  'border-edge bg-surface text-fg hover:border-edge-strong',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <Button onClick={next} className="self-end">
          {isLast ? 'Finalizar' : 'Avançar'}
        </Button>
      )}
    </div>
  );
}

function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
