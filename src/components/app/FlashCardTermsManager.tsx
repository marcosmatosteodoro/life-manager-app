'use client';

import Link from 'next/link';
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui/Loading';
import { toast } from '@/hooks/useToastStore';
import type { FlashCard } from '@/services/flashCard.types';
import { ApiError, flashCardService } from '@/services/flashCardService';
import { flashCardGroupService } from '@/services/flashCardGroupService';
import { cn } from '@/utils/cn';

type LoadState = 'loading' | 'loaded' | 'error';

const baseInput =
  'w-full rounded-md border px-3 py-2 text-sm text-neutral-900 outline-none transition-colors';

/** Limpa o termo antes de enviar: remove dois-pontos no final (ex.: "give up:"). */
function cleanTerm(raw: string): string {
  return raw.trim().replace(/:+$/, '').trim();
}

export function FlashCardTermsManager({ groupId }: { groupId: number }) {
  const [groupName, setGroupName] = useState('');
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  // Edição inline (apenas um card por vez).
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftTerm, setDraftTerm] = useState('');
  const [draftValue, setDraftValue] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleting, setDeleting] = useState<FlashCard | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // Adicionar novo termo.
  const [newTerm, setNewTerm] = useState('');
  const [newValue, setNewValue] = useState('');
  const [adding, setAdding] = useState(false);
  const newTermRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const group = await flashCardGroupService.get(groupId);
      setGroupName(group.name);
      setCards(group.flashCards ?? []);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error));
      setLoadState('error');
    }
  }, [groupId]);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(card: FlashCard) {
    setEditingId(card.id);
    setDraftTerm(card.term);
    setDraftValue(card.value ?? '');
  }

  function cancelEdit() {
    if (savingEdit) return;
    setEditingId(null);
  }

  async function saveEdit(card: FlashCard) {
    setSavingEdit(true);
    try {
      await flashCardService.update(card.id, {
        term: cleanTerm(draftTerm),
        value: draftValue.trim() ? draftValue.trim() : null,
      });
      toast.success('Termo atualizado com sucesso.');
      setEditingId(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error));
    } finally {
      setSavingEdit(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteInProgress(true);
    try {
      await flashCardService.remove(deleting.id);
      toast.success('Termo excluído com sucesso.');
      setDeleting(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error));
    } finally {
      setDeleteInProgress(false);
    }
  }

  async function addTerm(event: FormEvent) {
    event.preventDefault();
    setAdding(true);
    try {
      await flashCardService.create({
        term: cleanTerm(newTerm),
        value: newValue.trim() ? newValue.trim() : null,
        flashCardGroupId: groupId,
      });
      toast.success('Termo adicionado com sucesso.');
      // Continua na tela para adicionar quantos quiser.
      setNewTerm('');
      setNewValue('');
      newTermRef.current?.focus();
      await load();
    } catch (error) {
      toast.errors(toMessages(error));
    } finally {
      setAdding(false);
    }
  }

  // Aviso em tempo de escrita: termo já existente (comparação case-insensitive).
  // Usa o termo já limpo (sem ":" no final) para casar com o que será enviado.
  const normalizedNewTerm = cleanTerm(newTerm).toLowerCase();
  const duplicateIndex = normalizedNewTerm
    ? cards.findIndex((c) => c.term.trim().toLowerCase() === normalizedNewTerm)
    : -1;
  const duplicateTerm = duplicateIndex >= 0 ? cards[duplicateIndex] : null;

  return (
    <section className="mx-auto w-full max-w-3xl">
      <Link
        href="/revisar"
        className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        ← Voltar para grupos
      </Link>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
        {loadState === 'loaded' ? groupName : 'Gerenciar termos'}
      </h1>

      <div className="mt-6">
        {loadState === 'loading' && <Loading />}

        {loadState === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="whitespace-pre-line">{loadError.join('\n')}</p>
            <Button variant="secondary" className="mt-3" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {loadState === 'loaded' && (
          <div className="flex flex-col gap-3">
            {cards.length === 0 && (
              <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500">
                Nenhum termo ainda. Adicione o primeiro abaixo.
              </p>
            )}

            {cards.map((card, index) => {
              const isEditing = editingId === card.id;
              return (
                <div
                  key={card.id}
                  className="rounded-lg border border-neutral-200 bg-white p-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-2 w-6 shrink-0 text-sm font-medium text-neutral-400">
                      {index + 1}
                    </span>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input
                          aria-label="Termo"
                          value={isEditing ? draftTerm : card.term}
                          readOnly={!isEditing}
                          onChange={(e) => setDraftTerm(e.target.value)}
                          className={cn(
                            baseInput,
                            isEditing
                              ? 'border-neutral-300 focus:border-neutral-900'
                              : 'border-transparent bg-neutral-50',
                          )}
                        />
                        <input
                          aria-label="Tradução"
                          value={isEditing ? draftValue : (card.value ?? '')}
                          readOnly={!isEditing}
                          placeholder={isEditing ? 'Tradução (opcional)' : ''}
                          onChange={(e) => setDraftValue(e.target.value)}
                          className={cn(
                            baseInput,
                            isEditing
                              ? 'border-neutral-300 focus:border-neutral-900'
                              : 'border-transparent bg-neutral-50',
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-3 px-1 text-xs">
                        <span className="font-medium text-emerald-600">
                          ✓ {card.correctAnswers} acerto
                          {card.correctAnswers === 1 ? '' : 's'}
                        </span>
                        <span className="font-medium text-red-600">
                          ✗ {card.wrongAnswers} erro
                          {card.wrongAnswers === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {isEditing ? (
                        <>
                          <Button onClick={() => void saveEdit(card)} disabled={savingEdit}>
                            {savingEdit ? 'Salvando...' : 'Salvar'}
                          </Button>
                          <Button variant="secondary" onClick={cancelEdit} disabled={savingEdit}>
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" onClick={() => startEdit(card)}>
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setDeleting(card)}
                          >
                            Excluir
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Adicionar termo — permanece na tela para adicionar vários. */}
            <form
              onSubmit={addTerm}
              className="rounded-lg border border-dashed border-neutral-300 bg-white p-3"
            >
              <div className="flex items-start gap-3">
                <span className="mt-2 w-6 shrink-0 text-center text-sm font-medium text-neutral-400">
                  +
                </span>
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    ref={newTermRef}
                    aria-label="Novo termo"
                    required
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    placeholder="Termo"
                    aria-invalid={duplicateTerm ? true : undefined}
                    className={cn(
                      baseInput,
                      duplicateTerm
                        ? 'border-amber-400 focus:border-amber-500'
                        : 'border-neutral-300 focus:border-neutral-900',
                    )}
                  />
                  <input
                    aria-label="Nova tradução"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Tradução (opcional)"
                    className={cn(baseInput, 'border-neutral-300 focus:border-neutral-900')}
                  />
                </div>
                <div className="shrink-0">
                  <Button type="submit" disabled={adding}>
                    {adding ? 'Adicionando...' : 'Adicionar termo'}
                  </Button>
                </div>
              </div>
              {duplicateTerm && (
                <p className="mt-2 pl-9 text-xs text-amber-700">
                  {`"${duplicateTerm.term}" já existe na lista (posição ${duplicateIndex + 1}). Você ainda pode adicionar se quiser.`}
                </p>
              )}
            </form>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir termo"
        description={
          deleting
            ? `Tem certeza que deseja excluir "${deleting.term}"? Essa ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
        loading={deleteInProgress}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteInProgress) setDeleting(null);
        }}
      />
    </section>
  );
}

function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
