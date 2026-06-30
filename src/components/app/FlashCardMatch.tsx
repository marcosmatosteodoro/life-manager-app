'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToastStore';
import type { FlashCard } from '@/services/flashCard.types';
import { ApiError, flashCardService } from '@/services/flashCardService';
import { cn } from '@/utils/cn';

// Até 6 keys → 12 cards (term + value), grade 3×4.
const MAX_KEYS = 6;
const WRONG_MS = 650;

interface Tile {
  uid: string;
  cardId: number;
  kind: 'term' | 'value';
  text: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Monta os 12 cards embaralhados a partir de até 6 keys com tradução. */
function buildTiles(cards: FlashCard[]): Tile[] {
  const usable = cards
    .filter((c) => c.value && c.value.trim())
    .slice(0, MAX_KEYS);
  const tiles: Tile[] = [];
  for (const c of usable) {
    tiles.push({ uid: `${c.id}-t`, cardId: c.id, kind: 'term', text: c.term });
    tiles.push({
      uid: `${c.id}-v`,
      cardId: c.id,
      kind: 'value',
      text: c.value as string,
    });
  }
  return shuffle(tiles);
}

export function FlashCardMatch({
  cards,
  onReplay,
  onExit,
}: {
  cards: FlashCard[];
  /** Busca um novo sorteio no back (remonta o jogo). Sem ele, reembaralha os mesmos cards. */
  onReplay?: () => void;
  onExit?: () => void;
}) {
  const [tiles, setTiles] = useState<Tile[]>(() => buildTiles(cards));
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<Record<number, number>>({});
  const [flashing, setFlashing] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [done, setDone] = useState(false);

  const keyIds = [...new Set(tiles.map((t) => t.cardId))];
  const totalErrors = Object.values(wrong).reduce((s, n) => s + n, 0);

  if (keyIds.length < 2) {
    return (
      <p className="rounded-lg border border-dashed border-edge-strong px-4 py-16 text-center text-sm text-fg-muted">
        Cadastre ao menos 2 termos com tradução neste grupo para jogar a
        combinação.
      </p>
    );
  }

  function replay() {
    setTiles(buildTiles(cards));
    setSelected(null);
    setMatched(new Set());
    setWrong({});
    setFlashing([]);
    setLocked(false);
    setDone(false);
  }

  function handleClick(tile: Tile) {
    if (locked || done || matched.has(tile.cardId)) return;

    // Clicar no já selecionado → desmarca.
    if (selected === tile.uid) {
      setSelected(null);
      return;
    }
    // Primeiro clique da dupla.
    if (selected === null) {
      setSelected(tile.uid);
      return;
    }

    const first = tiles.find((t) => t.uid === selected);
    if (!first) {
      setSelected(tile.uid);
      return;
    }

    if (first.cardId === tile.cardId) {
      // Acerto: some/trava o par.
      const next = new Set(matched).add(tile.cardId);
      setMatched(next);
      setSelected(null);
      if (next.size === keyIds.length) {
        void finish(wrong);
      }
    } else {
      // Erro: conta no card clicado primeiro + animação.
      setWrong((w) => ({ ...w, [first.cardId]: (w[first.cardId] ?? 0) + 1 }));
      setFlashing([first.uid, tile.uid]);
      setLocked(true);
      setTimeout(() => {
        setFlashing([]);
        setSelected(null);
        setLocked(false);
      }, WRONG_MS);
    }
  }

  // Envia as notas só ao combinar tudo: 1 acerto por key + os erros acumulados.
  async function finish(finalWrong: Record<number, number>) {
    setDone(true);
    try {
      const items = keyIds.map((id) => ({
        id,
        correctAnswers: 1,
        wrongAnswers: finalWrong[id] ?? 0,
      }));
      await flashCardService.reviewBlock(items);
      toast.success('Combinação concluída! Notas salvas.');
    } catch (error) {
      toast.errors(toMessages(error));
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      {/* Mensagens no topo */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-fg-muted">
          {matched.size} / {keyIds.length} pares
        </span>
        <span className="font-medium text-red-600">
          {totalErrors} erro{totalErrors === 1 ? '' : 's'}
        </span>
      </div>

      {done ? (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-12 text-center">
          <span aria-hidden className="text-4xl">
            🎉
          </span>
          <p className="text-lg font-semibold text-emerald-800">
            Tudo combinado!
          </p>
          <p className="text-sm text-emerald-700">
            {totalErrors} erro{totalErrors === 1 ? '' : 's'} no total.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={onReplay ?? replay}>Jogar de novo</Button>
            {onExit && (
              <Button variant="secondary" onClick={onExit}>
                Trocar modo
              </Button>
            )}
          </div>
        </div>
      ) : (
        // Cards ocupam o resto da tela; fonte se ajusta à largura disponível.
        <div className="mt-4 grid flex-1 auto-rows-fr grid-cols-3 gap-2">
          {tiles.map((tile) => {
            const isMatched = matched.has(tile.cardId);
            const isSelected = selected === tile.uid;
            const isWrong = flashing.includes(tile.uid);
            return (
              <button
                key={tile.uid}
                type="button"
                disabled={isMatched}
                onClick={() => handleClick(tile)}
                className={cn(
                  'flex h-full w-full items-center justify-center rounded-xl border p-2 text-center leading-tight break-words [overflow-wrap:anywhere] text-[length:clamp(0.7rem,3.2vw,1.15rem)] font-medium transition-colors',
                  isWrong &&
                    'animate-shake border-red-300 bg-red-50 text-red-700',
                  !isWrong &&
                    isSelected &&
                    'border-edge-inverse bg-surface-inverse text-surface',
                  !isWrong &&
                    isMatched &&
                    'border-emerald-200 bg-emerald-50 text-emerald-700 opacity-50',
                  !isWrong &&
                    !isSelected &&
                    !isMatched &&
                    'border-edge bg-surface text-fg hover:border-edge-strong',
                )}
              >
                {tile.text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
