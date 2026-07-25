'use client';

import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { inputClass } from '@/components/ui/Field';
import { toast } from '@/hooks/useToastStore';
import { ApiError, backlogService } from '@/services/backlogService';
import type { BacklogItem as BacklogItemType } from '@/services/backlog.types';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/utils/cn';
import { AudioRecorder } from './AudioRecorder';

interface BacklogItemProps {
  item: BacklogItemType;
  onComplete?: (id: number) => void;
  onReopen?: (id: number) => void;
  onDelete: (id: number) => void;
  onSave: (id: number, data: { name: string; description: string }) => void;
  /** Recarrega a lista após gravar/excluir áudio (atualiza hasAudio). */
  onAudioChanged?: () => void;
  /** Handle de arraste (só nos pendentes). */
  dragHandle?: ReactNode;
}

/** Linha do backlog: position + título + data; expande p/ descrição + copiar. */
export function BacklogItem({
  item,
  onComplete,
  onReopen,
  onDelete,
  onSave,
  onAudioChanged,
  dragHandle,
}: BacklogItemProps) {
  const { t } = useTranslation(['backlog', 'common']);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? '');

  async function copyDescription() {
    if (!item.description) return;
    try {
      await navigator.clipboard.writeText(item.description);
      toast.success(t('descriptionCopied'));
    } catch {
      toast.error(t('copyError'));
    }
  }

  function startEdit() {
    setName(item.name);
    setDescription(item.description ?? '');
    setEditing(true);
    setOpen(true);
  }

  function saveEdit() {
    if (!name.trim()) {
      toast.errors([t('nameRequired')]);
      return;
    }
    onSave(item.id, { name: name.trim(), description: description.trim() });
    setEditing(false);
  }

  return (
    <div className="rounded-lg border border-edge bg-surface">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        {dragHandle}

        {item.position != null && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-xs font-semibold text-fg-muted">
            {item.position}
          </span>
        )}

        {/* Título + data (clique expande) */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-fg">
              {item.name}
            </span>
            <span className="block text-xs text-fg-subtle">
              {formatDateTime(item.createdAt)}
            </span>
          </span>
          <ChevronIcon
            className={cn(
              'h-4 w-4 shrink-0 text-fg-subtle transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>

        {/* Ações — no mobile quebram para uma 2ª linha (w-full); em sm ficam inline */}
        <div className="flex w-full shrink-0 items-center justify-end gap-1 sm:w-auto">
          {onComplete && (
            <IconButton
              onClick={() => onComplete(item.id)}
              aria-label={t('complete')}
              title={t('complete')}
            >
              <CheckIcon className="h-5 w-5" />
            </IconButton>
          )}
          {onReopen && (
            <IconButton
              onClick={() => onReopen(item.id)}
              aria-label={t('reopen')}
              title={t('reopen')}
            >
              <UndoIcon className="h-5 w-5" />
            </IconButton>
          )}
          <IconButton
            onClick={startEdit}
            aria-label={t('common:edit')}
            title={t('common:edit')}
          >
            <PencilIcon className="h-5 w-5" />
          </IconButton>
          <IconButton
            onClick={() => onDelete(item.id)}
            aria-label={t('common:delete')}
            title={t('common:delete')}
            className="hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon className="h-5 w-5" />
          </IconButton>
        </div>
      </div>

      {/* Collapse: descrição + copiar (ou edição) */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-edge px-3 py-3">
            {editing ? (
              <div className="flex flex-col gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder={t('namePlaceholder')}
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={inputClass}
                  placeholder={t('descriptionFieldPlaceholder')}
                />
                <div className="flex gap-2">
                  <Button onClick={saveEdit}>{t('common:save')}</Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditing(false)}
                  >
                    {t('common:cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {item.description ? (
                  <p className="whitespace-pre-wrap text-sm text-fg-soft">
                    {item.description}
                  </p>
                ) : (
                  <p className="text-sm text-fg-subtle">{t('noDescription')}</p>
                )}
                {item.description && (
                  <Button
                    variant="secondary"
                    onClick={() => void copyDescription()}
                    className="self-start"
                  >
                    <CopyIcon className="h-4 w-4" />
                    {t('copy')}
                  </Button>
                )}
                <BacklogAudioSection item={item} onChanged={onAudioChanged} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Nota de voz do item: ouvir (sob demanda), gravar/regravar e excluir. */
function BacklogAudioSection({
  item,
  onChanged,
}: {
  item: BacklogItemType;
  onChanged?: () => void;
}) {
  const { t } = useTranslation(['backlog', 'common']);
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);

  function errors(error: unknown): string[] {
    return error instanceof ApiError
      ? error.messages
      : [t('common:unexpectedError')];
  }

  async function loadAudio() {
    setLoading(true);
    try {
      const audio = await backlogService.getAudio(item.id);
      setSrc(`data:${audio.mimeType};base64,${audio.data}`);
    } catch (error) {
      toast.errors(errors(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(audio: { data: string; mimeType: string }) {
    setSaving(true);
    try {
      await backlogService.setAudio(item.id, audio);
      toast.success(t('backlog:audio.saved'));
      setRecording(false);
      setSrc(null);
      onChanged?.();
    } catch (error) {
      toast.errors(errors(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(t('backlog:audio.confirmDelete'))) return;
    try {
      await backlogService.removeAudio(item.id);
      toast.success(t('backlog:audio.deleted'));
      setSrc(null);
      onChanged?.();
    } catch (error) {
      toast.errors(errors(error));
    }
  }

  const hasAudio = Boolean(item.hasAudio);

  return (
    <div className="flex flex-col gap-2 border-t border-edge pt-2">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
        {t('backlog:audio.title')}
      </p>

      {recording || !hasAudio ? (
        <AudioRecorder
          onSave={handleSave}
          saving={saving}
          recordLabel={
            hasAudio ? t('backlog:audio.rerecord') : t('backlog:audio.record')
          }
          onCancel={hasAudio ? () => setRecording(false) : undefined}
        />
      ) : (
        <>
          {src ? (
            <audio controls autoPlay src={src} className="w-full" />
          ) : (
            <Button
              variant="secondary"
              onClick={() => void loadAudio()}
              disabled={loading}
              className="self-start"
            >
              {t('backlog:audio.listen')}
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setRecording(true)}>
              {t('backlog:audio.rerecord')}
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => void handleDelete()}
            >
              {t('backlog:audio.delete')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function UndoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  );
}

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
