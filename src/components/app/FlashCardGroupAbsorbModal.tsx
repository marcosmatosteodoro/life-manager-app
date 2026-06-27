'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { FlashCardGroup } from '@/services/flashCardGroup.types';
import { cn } from '@/utils/cn';

interface FlashCardGroupAbsorbModalProps {
  open: boolean;
  /** Grupo que vai absorver (destino — recebe os flashcards). */
  target: FlashCardGroup | null;
  /** Demais grupos disponíveis para serem absorvidos (origem). */
  candidates: FlashCardGroup[];
  submitting: boolean;
  onConfirm: (sourceId: number) => void;
  onCancel: () => void;
}

/**
 * Modal de "absorver lista": escolhe-se a lista de origem (que será mesclada
 * no destino e excluída) e confirma-se a ação, deixando claro o que ocorre.
 */
export function FlashCardGroupAbsorbModal({
  open,
  target,
  candidates,
  submitting,
  onConfirm,
  onCancel,
}: FlashCardGroupAbsorbModalProps) {
  // A seleção começa vazia. O componente é remontado a cada abertura (via
  // `key` no pai), então não precisa de efeito para resetar entre grupos.
  const [sourceId, setSourceId] = useState<number | null>(null);

  if (!target) return null;

  const source = candidates.find((group) => group.id === sourceId) ?? null;

  return (
    <Modal
      open={open}
      title={`Absorver lista em "${target.name}"`}
      onClose={onCancel}
    >
      {candidates.length === 0 ? (
        <p className="text-sm text-neutral-600">
          Não há outras listas para absorver.
        </p>
      ) : (
        <>
          <p className="text-sm text-neutral-600">
            Escolha a lista a ser absorvida. Os flashcards dela serão movidos
            para <span className="font-medium">{target.name}</span> e a lista
            escolhida será excluída.
          </p>

          <ul className="mt-4 flex max-h-64 flex-col gap-2 overflow-y-auto">
            {candidates.map((group) => {
              const selected = group.id === sourceId;
              const count = group.flashCardsCount ?? 0;
              return (
                <li key={group.id}>
                  <button
                    type="button"
                    onClick={() => setSourceId(group.id)}
                    aria-pressed={selected}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                      selected
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-200 hover:border-neutral-400',
                    )}
                  >
                    <span className="truncate text-sm font-medium text-neutral-900">
                      {group.name}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-500">
                      {count} flashcard{count === 1 ? '' : 's'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {source && (
            <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {`"${source.name}" será mesclada em "${target.name}" e depois excluída. Esta ação não pode ser desfeita.`}
            </p>
          )}
        </>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          onClick={() => sourceId !== null && onConfirm(sourceId)}
          disabled={submitting || sourceId === null}
        >
          {submitting ? 'Absorvendo...' : 'Absorver'}
        </Button>
      </div>
    </Modal>
  );
}
