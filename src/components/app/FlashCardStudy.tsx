'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { toast } from '@/hooks/useToastStore';
import type { FlashCard } from '@/services/flashCard.types';
import type { FlashCardGroupType } from '@/services/flashCardGroup.types';
import { ApiError, flashCardService } from '@/services/flashCardService';
import { flashCardGroupService } from '@/services/flashCardGroupService';
import { cn } from '@/utils/cn';
import { toDataUrl } from '@/utils/image';
import { FlashCardMatch } from './FlashCardMatch';
import { FlashCardQuiz } from './FlashCardQuiz';

type LoadState = 'loading' | 'loaded' | 'error';
type StudyMode = 'classico' | 'combinacao' | 'avaliacao';

const MODE_KEYS: Record<StudyMode, string> = {
  classico: 'modeClassic',
  combinacao: 'modeMatch',
  avaliacao: 'modeQuiz',
};

// Grupos de imagem só têm clássico + combinação (sem quiz de texto).
const MODES_BY_TYPE: Record<FlashCardGroupType, StudyMode[]> = {
  text: ['classico', 'combinacao', 'avaliacao'],
  image: ['classico', 'combinacao'],
};

export function FlashCardStudy({ groupId }: { groupId: number }) {
  const { t } = useTranslation(['flashcards', 'common']);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const [index, setIndex] = useState(0);
  // Muda a cada carga: usado como key para remontar a Combinação com o
  // novo sorteio aleatório vindo do back (ao trocar de modo ou jogar de novo).
  const [draw, setDraw] = useState(0);
  const [showValue, setShowValue] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [mode, setMode] = useState<StudyMode>('classico');
  const [groupType, setGroupType] = useState<FlashCardGroupType>('text');
  // Imagens (base64 → data URL) dos cards, em grupos do tipo 'image'.
  const [images, setImages] = useState<Record<number, string>>({});
  const isImage = groupType === 'image';

  // Busca o tipo do grupo uma vez (decide os modos e a renderização).
  useEffect(() => {
    let active = true;
    void flashCardGroupService
      .get(groupId)
      .then((group) => {
        if (active) setGroupType(group.type);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [groupId]);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      // Combinação usa ordem aleatória (varia o subconjunto a cada partida);
      // o modo um a um usa a ordenação de revisão (difíceis/antigos primeiro).
      const rows =
        mode === 'combinacao'
          ? await flashCardGroupService.reviewBlock(groupId)
          : await flashCardGroupService.review(groupId);
      setCards(rows);
      setIndex(0);
      setDraw((d) => d + 1);
      setShowValue(false);
      setShowTranslation(false);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error, t('common:unexpectedError')));
      setLoadState('error');
    }
  }, [groupId, mode, t]);

  useEffect(() => {
    void load();
  }, [load]);

  // Em grupos de imagem, busca o base64 dos cards que têm imagem (sob demanda).
  useEffect(() => {
    if (!isImage || cards.length === 0) return;
    let active = true;
    const pending = cards.filter((c) => c.hasImage && !images[c.id]);
    if (pending.length === 0) return;
    void Promise.all(
      pending.map((c) =>
        flashCardService
          .getImage(c.id)
          .then((photo) => [c.id, toDataUrl(photo)] as const)
          .catch(() => null),
      ),
    ).then((entries) => {
      if (active) {
        setImages((prev) => ({
          ...prev,
          ...Object.fromEntries(entries.filter((e) => e !== null)),
        }));
      }
    });
    return () => {
      active = false;
    };
  }, [cards, isImage, images]);

  const current = cards[index];
  const finished = loadState === 'loaded' && index >= cards.length;

  async function answer(correct: boolean) {
    if (!current || saving) return;
    setSaving(true);
    try {
      await flashCardService.review(current.id, correct);
      // Próxima palavra.
      setShowValue(false);
      setShowTranslation(false);
      setIndex((i) => i + 1);
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setSaving(false);
    }
  }

  async function translate() {
    if (!current || translating) return;
    // Se já tem tradução salva, só revela (sem nova chamada).
    if (current.translation) {
      setShowTranslation(true);
      return;
    }
    setTranslating(true);
    try {
      const updated = await flashCardService.translate(current.id);
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setShowTranslation(true);
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setTranslating(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col">
      {/* Topo: progresso + voltar */}
      <div className="flex items-center justify-between">
        <Link
          href="/revisar"
          className="text-sm text-fg-muted transition-colors hover:text-fg"
        >
          {t('back')}
        </Link>
        {loadState === 'loaded' &&
          mode === 'classico' &&
          cards.length > 0 &&
          !finished && (
            <span className="text-sm font-medium text-fg-muted">
              {index + 1} / {cards.length}
            </span>
          )}
      </div>

      {/* Seletor de modo */}
      {loadState === 'loaded' && cards.length > 0 && (
        <div className="mt-4 flex gap-1 self-center rounded-lg border border-edge bg-surface-muted p-1">
          {MODES_BY_TYPE[groupType].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                mode === m
                  ? 'bg-surface-inverse text-surface'
                  : 'text-fg-muted hover:text-fg',
              )}
            >
              {t(MODE_KEYS[m])}
            </button>
          ))}
        </div>
      )}

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

        {loadState === 'loaded' && cards.length === 0 && (
          <p className="rounded-lg border border-dashed border-edge-strong px-4 py-16 text-center text-sm text-fg-muted">
            {t('noCardsToStudy')}
          </p>
        )}

        {loadState === 'loaded' && mode === 'combinacao' && cards.length > 0 && (
          <FlashCardMatch
            key={draw}
            cards={cards}
            variant={isImage ? 'image' : 'text'}
            images={images}
            onReplay={() => void load()}
            onExit={() => setMode('classico')}
          />
        )}

        {loadState === 'loaded' && mode === 'avaliacao' && cards.length > 0 && (
          <FlashCardQuiz groupId={groupId} onExit={() => setMode('classico')} />
        )}

        {loadState === 'loaded' &&
          mode === 'classico' &&
          finished &&
          cards.length > 0 && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-16 text-center">
            <span aria-hidden className="text-4xl">
              🎉
            </span>
            <p className="text-lg font-semibold text-emerald-800">
              {t('studyFinished')}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => void load()}>{t('studyAgain')}</Button>
              <Link href="/revisar">
                <Button variant="secondary">{t('backToGroupsButton')}</Button>
              </Link>
            </div>
          </div>
        )}

        {loadState === 'loaded' && mode === 'classico' && current && !finished && (
          <div className="flex flex-col items-center gap-6">
            {/* Card grande com efeito de virar (flip 3D no eixo Y) */}
            <div className="w-full [perspective:1200px]">
              <button
                type="button"
                aria-label={t('flipCard')}
                onClick={() => setShowValue((v) => !v)}
                className={cn(
                  'relative h-64 w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d]',
                  showValue && '[transform:rotateY(180deg)]',
                )}
              >
                {/* Frente: termo */}
                <span className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-edge bg-surface p-6 text-center shadow-sm [backface-visibility:hidden]">
                  <span className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-subtle">
                    {isImage ? t('labelImage') : t('labelTerm')}
                  </span>
                  {isImage ? (
                    images[current.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={images[current.id]}
                        alt=""
                        className="max-h-40 w-auto rounded-md object-contain"
                      />
                    ) : (
                      <span className="text-sm text-fg-subtle">
                        {t('imageMissing')}
                      </span>
                    )
                  ) : (
                    <span className="text-3xl font-semibold break-words text-fg">
                      {current.term}
                    </span>
                  )}
                  <span className="mt-4 text-xs text-fg-subtle">
                    {t('clickToFlip')}
                  </span>
                </span>

                {/* Verso: termo (imagem) ou tradução (texto) — rotacionado 180° */}
                <span className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-edge bg-surface p-6 text-center shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <span className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-subtle">
                    {isImage ? t('labelTerm') : t('labelTranslation')}
                  </span>
                  <span className="text-3xl font-semibold break-words text-fg">
                    {isImage ? current.term : (current.value ?? '—')}
                  </span>
                  <span className="mt-4 text-xs text-fg-subtle">
                    {t('clickToFlip')}
                  </span>
                </span>
              </button>
            </div>

            {/* Erro (x vermelho) e acerto (v verde) */}
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                aria-label={t('gotWrong')}
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
                aria-label={t('gotRight')}
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

            {/* Traduzir (só texto): busca a tradução (en→pt) e a salva; depois reusa */}
            {!isImage && (
              <div className="flex w-full flex-col items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={translating}
                  onClick={() => void translate()}
                >
                  {translating ? t('translating') : t('translate')}
                </Button>

                {showTranslation && current.translation && (
                  <p className="text-center text-sm text-fg-muted">
                    <span className="text-fg-subtle">
                      {t('translationLabel')}
                    </span>
                    <span className="font-medium text-fg">
                      {current.translation}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function toMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiError) return error.messages;
  return [fallback];
}
