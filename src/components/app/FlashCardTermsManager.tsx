'use client';

import Link from 'next/link';
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui/Loading';
import { toast } from '@/hooks/useToastStore';
import type { FlashCard } from '@/services/flashCard.types';
import type { FlashCardGroupType } from '@/services/flashCardGroup.types';
import { ApiError, flashCardService } from '@/services/flashCardService';
import { flashCardGroupService } from '@/services/flashCardGroupService';
import { cn } from '@/utils/cn';
import { type CompressedImage, compressImage, toDataUrl } from '@/utils/image';

type LoadState = 'loading' | 'loaded' | 'error';

const baseInput =
  'w-full rounded-md border px-3 py-2 text-sm text-fg outline-none transition-colors';

/** Limpa o termo antes de enviar: remove dois-pontos no final (ex.: "give up:"). */
function cleanTerm(raw: string): string {
  return raw.trim().replace(/:+$/, '').trim();
}

export function FlashCardTermsManager({ groupId }: { groupId: number }) {
  const { t } = useTranslation(['flashcards', 'common']);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<FlashCardGroupType>('text');
  const [cards, setCards] = useState<FlashCard[]>([]);
  // Data URLs das imagens dos cards (grupos tipo 'image').
  const [cardImages, setCardImages] = useState<Record<number, string>>({});
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const isImage = groupType === 'image';

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
  const [newImage, setNewImage] = useState<CompressedImage | null>(null);
  const [adding, setAdding] = useState(false);
  const newTermRef = useRef<HTMLInputElement>(null);
  const addFormRef = useRef<HTMLFormElement>(null);
  // Rola até o formulário de adicionar só uma vez, no primeiro carregamento.
  const didInitialScroll = useRef(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const group = await flashCardGroupService.get(groupId);
      setGroupName(group.name);
      setGroupType(group.type);
      const rows = group.flashCards ?? [];
      setCards(rows);
      // Em grupos de imagem, busca o base64 dos cards que já têm imagem.
      if (group.type === 'image') {
        const withImage = rows.filter((c) => c.hasImage);
        const loaded = await Promise.all(
          withImage.map((c) =>
            flashCardService
              .getImage(c.id)
              .then((p) => [c.id, toDataUrl(p)] as const)
              .catch(() => null),
          ),
        );
        setCardImages(
          Object.fromEntries(loaded.filter((e) => e !== null)),
        );
      }
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error, t('common:unexpectedError')));
      setLoadState('error');
    }
  }, [groupId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  // Ao terminar de carregar pela 1ª vez, começa embaixo (no "Adicionar termo").
  useEffect(() => {
    if (loadState !== 'loaded' || didInitialScroll.current) return;
    didInitialScroll.current = true;
    addFormRef.current?.scrollIntoView({ block: 'end' });
    newTermRef.current?.focus({ preventScroll: true });
  }, [loadState]);

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
        // Grupos de imagem não usam o campo "value".
        value: isImage ? null : draftValue.trim() ? draftValue.trim() : null,
      });
      toast.success(t('termUpdated'));
      setEditingId(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setSavingEdit(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteInProgress(true);
    try {
      await flashCardService.remove(deleting.id);
      toast.success(t('termDeleted'));
      setDeleting(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setDeleteInProgress(false);
    }
  }

  async function addTerm(event: FormEvent) {
    event.preventDefault();
    setAdding(true);
    try {
      const created = await flashCardService.create({
        term: cleanTerm(newTerm),
        value: isImage ? null : newValue.trim() ? newValue.trim() : null,
        flashCardGroupId: groupId,
      });
      // No modo imagem, sobe a imagem escolhida para o card recém-criado.
      if (isImage && newImage) {
        await flashCardService.setImage(created.id, newImage);
      }
      toast.success(t('termAdded'));
      // Continua na tela para adicionar quantos quiser.
      setNewTerm('');
      setNewValue('');
      setNewImage(null);
      newTermRef.current?.focus();
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setAdding(false);
    }
  }

  /** Sobe/troca a imagem de um card existente (efeito imediato). */
  async function changeCardImage(cardId: number, image: CompressedImage) {
    try {
      const saved = await flashCardService.setImage(cardId, image);
      setCardImages((prev) => ({ ...prev, [cardId]: toDataUrl(saved) }));
      toast.success(t('imageUpdated'));
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    }
  }

  async function removeCardImage(cardId: number) {
    try {
      await flashCardService.removeImage(cardId);
      setCardImages((prev) => {
        const next = { ...prev };
        delete next[cardId];
        return next;
      });
      toast.success(t('imageRemoved'));
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    }
  }

  // Aviso em tempo de escrita: termo já existente (case-insensitive).
  const normalizedNewTerm = cleanTerm(newTerm).toLowerCase();
  const duplicateIndex = normalizedNewTerm
    ? cards.findIndex((c) => c.term.trim().toLowerCase() === normalizedNewTerm)
    : -1;
  const duplicateTerm = duplicateIndex >= 0 ? cards[duplicateIndex] : null;

  return (
    <section className="mx-auto w-full max-w-3xl">
      <Link
        href="/revisar"
        className="text-sm text-fg-muted transition-colors hover:text-fg"
      >
        {t('backToGroups')}
      </Link>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
        {loadState === 'loaded' ? groupName : t('manageTermsTitle')}
      </h1>

      <div className="mt-6">
        {loadState === 'loading' && <Loading />}

        {loadState === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="whitespace-pre-line">{loadError.join('\n')}</p>
            <Button variant="secondary" className="mt-3" onClick={() => void load()}>
              {t('common:retry')}
            </Button>
          </div>
        )}

        {loadState === 'loaded' && (
          <div className="flex flex-col gap-3">
            {cards.length === 0 && (
              <p className="rounded-lg border border-dashed border-edge-strong px-4 py-8 text-center text-sm text-fg-muted">
                {t('emptyTerms')}
              </p>
            )}

            {cards.map((card, index) => {
              const isEditing = editingId === card.id;
              return (
                <div
                  key={card.id}
                  className="rounded-lg border border-edge bg-surface p-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-2 w-6 shrink-0 text-sm font-medium text-fg-subtle">
                      {index + 1}
                    </span>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        {isImage && (
                          <ImagePicker
                            src={cardImages[card.id] ?? null}
                            onPick={(img) => void changeCardImage(card.id, img)}
                            onRemove={() => void removeCardImage(card.id)}
                          />
                        )}
                        <div
                          className={cn(
                            'grid flex-1 grid-cols-1 gap-3',
                            !isImage && 'sm:grid-cols-2',
                          )}
                        >
                          <input
                            aria-label={isImage ? t('imageTextLabel') : t('fieldTerm')}
                            value={isEditing ? draftTerm : card.term}
                            readOnly={!isEditing}
                            onChange={(e) => setDraftTerm(e.target.value)}
                            className={cn(
                              baseInput,
                              isEditing
                                ? 'border-edge-strong focus:border-edge-inverse'
                                : 'border-transparent bg-surface-muted',
                            )}
                          />
                          {!isImage && (
                            <input
                              aria-label={t('fieldTranslation')}
                              value={isEditing ? draftValue : (card.value ?? '')}
                              readOnly={!isEditing}
                              placeholder={isEditing ? t('translationPlaceholder') : ''}
                              onChange={(e) => setDraftValue(e.target.value)}
                              className={cn(
                                baseInput,
                                isEditing
                                  ? 'border-edge-strong focus:border-edge-inverse'
                                  : 'border-transparent bg-surface-muted',
                              )}
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-1 text-xs">
                        <span className="font-medium text-emerald-600">
                          {t('correctCount', { count: card.correctAnswers })}
                        </span>
                        <span className="font-medium text-red-600">
                          {t('wrongCount', { count: card.wrongAnswers })}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {isEditing ? (
                        <>
                          <Button onClick={() => void saveEdit(card)} disabled={savingEdit}>
                            {savingEdit ? t('saving') : t('common:save')}
                          </Button>
                          <Button variant="secondary" onClick={cancelEdit} disabled={savingEdit}>
                            {t('common:cancel')}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" onClick={() => startEdit(card)}>
                            {t('common:edit')}
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setDeleting(card)}
                          >
                            {t('common:delete')}
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
              ref={addFormRef}
              onSubmit={addTerm}
              className="rounded-lg border border-dashed border-edge-strong bg-surface p-3"
            >
              <div className="flex items-start gap-3">
                <span className="mt-2 w-6 shrink-0 text-center text-sm font-medium text-fg-subtle">
                  +
                </span>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start">
                  {isImage && (
                    <ImagePicker
                      src={newImage ? toDataUrl(newImage) : null}
                      onPick={(img) => setNewImage(img)}
                      onRemove={() => setNewImage(null)}
                    />
                  )}
                  <div
                    className={cn(
                      'grid flex-1 grid-cols-1 gap-3',
                      !isImage && 'sm:grid-cols-2',
                    )}
                  >
                    <input
                      ref={newTermRef}
                      aria-label={isImage ? t('imageTextLabel') : t('newTerm')}
                      required
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                      placeholder={
                        isImage ? t('imageTextPlaceholder') : t('termPlaceholder')
                      }
                      aria-invalid={duplicateTerm ? true : undefined}
                      className={cn(
                        baseInput,
                        duplicateTerm
                          ? 'border-amber-400 focus:border-amber-500'
                          : 'border-edge-strong focus:border-edge-inverse',
                      )}
                    />
                    {!isImage && (
                      <input
                        aria-label={t('newTranslation')}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder={t('translationPlaceholder')}
                        className={cn(baseInput, 'border-edge-strong focus:border-edge-inverse')}
                      />
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <Button type="submit" disabled={adding}>
                    {adding ? t('adding') : t('addTerm')}
                  </Button>
                </div>
              </div>
              {duplicateTerm && (
                <p className="mt-2 pl-9 text-xs text-amber-700">
                  {t('duplicateTerm', {
                    term: duplicateTerm.term,
                    position: duplicateIndex + 1,
                  })}
                </p>
              )}
            </form>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title={t('deleteTermTitle')}
        description={
          deleting
            ? t('deleteTermDescription', { term: deleting.term })
            : ''
        }
        confirmLabel={t('common:delete')}
        loading={deleteInProgress}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteInProgress) setDeleting(null);
        }}
      />
    </section>
  );
}

/** Miniatura + escolher/trocar/remover imagem de um card. */
function ImagePicker({
  src,
  onPick,
  onRemove,
}: {
  src: string | null;
  onPick: (image: CompressedImage) => void | Promise<void>;
  onRemove: () => void | Promise<void>;
}) {
  const { t } = useTranslation(['flashcards', 'common']);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined | null) {
    if (!file || !file.type.startsWith('image/')) return;
    setBusy(true);
    try {
      await onPick(await compressImage(file));
    } catch {
      toast.errors([t('common:avatar.loadError')]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-edge bg-surface-subtle text-xl text-fg-subtle">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden>🖼️</span>
        )}
      </div>
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="text-fg-muted underline hover:text-fg disabled:opacity-50"
        >
          {src ? t('changeImage') : t('addImage')}
        </button>
        {src && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void onRemove()}
            className="text-red-600 underline hover:text-red-700 disabled:opacity-50"
          >
            {t('common:delete')}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function toMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiError) return error.messages;
  return [fallback];
}
