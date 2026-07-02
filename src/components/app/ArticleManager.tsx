'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import { ApiError, articleService } from '@/services/articleService';
import type { Article, ArticleInput } from '@/services/article.types';
import { isToday } from '@/utils/date';
import { ArticleForm } from './ArticleForm';
import { ArticleList } from './ArticleList';
import { TodayStudyBanner } from './TodayStudyBanner';

type LoadState = 'loading' | 'loaded' | 'error';

export function ArticleManager() {
  const { t } = useTranslation(['articles', 'common']);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<Article | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // Estudo de hoje: primeiro artigo cujo createdAt é de hoje.
  const todayStudy = useMemo(
    () => articles.find((a) => isToday(a.createdAt)) ?? null,
    [articles],
  );

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const { rows } = await articleService.list();
      setArticles(rows);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error, t('common:unexpectedError')));
      setLoadState('error');
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(article: Article) {
    setEditing(article);
    setFormOpen(true);
  }

  function closeForm() {
    if (submitting) return;
    setFormOpen(false);
  }

  async function handleSubmit(input: ArticleInput) {
    setSubmitting(true);
    try {
      if (editing) {
        await articleService.update(editing.id, input);
        toast.success(t('studyUpdated'));
      } else {
        await articleService.create(input);
        toast.success(t('studyCreated'));
      }
      setFormOpen(false);
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Dispara a correção via IA do artigo (o back salva summaryCorrected + score).
   * Atualiza o artigo na lista e devolve-o para o form refletir nos campos.
   * Retorna null em caso de erro (mensagem já exibida no toast).
   */
  async function handleCorrect(id: number): Promise<Article | null> {
    try {
      const updated = await articleService.correctSummary(id);
      setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast.success(t('summaryCorrected'));
      return updated;
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
      return null;
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteInProgress(true);
    try {
      await articleService.remove(deleting.id);
      toast.success(t('studyDeleted'));
      setDeleting(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setDeleteInProgress(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {t('title')}
        </h1>
        <Button onClick={openCreate}>{t('registerStudy')}</Button>
      </div>

      {loadState === 'loaded' && (
        <div className="mt-6">
          <TodayStudyBanner todayStudy={todayStudy} />
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

        {loadState === 'loaded' && (
          <ArticleList
            articles={articles}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
        )}
      </div>

      <Modal
        open={formOpen}
        title={editing ? t('editStudy') : t('registerStudy')}
        onClose={closeForm}
      >
        <ArticleForm
          key={editing?.id ?? 'new'}
          initial={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCorrect={handleCorrect}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={t('deleteTitle')}
        description={t('deleteDescription')}
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

/** Extrai mensagens exibíveis de um erro (ApiError ou genérico). */
function toMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiError) return error.messages;
  return [fallback];
}
