'use client';

import { type ReactNode, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { inputClass } from '@/components/ui/Field';
import { toast } from '@/hooks/useToastStore';
import type { BacklogItem as BacklogItemType } from '@/services/backlog.types';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/utils/cn';

interface BacklogItemProps {
  item: BacklogItemType;
  onComplete?: (id: number) => void;
  onReopen?: (id: number) => void;
  onDelete: (id: number) => void;
  onSave: (id: number, data: { name: string; description: string }) => void;
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
  dragHandle,
}: BacklogItemProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? '');

  async function copyDescription() {
    if (!item.description) return;
    try {
      await navigator.clipboard.writeText(item.description);
      toast.success('Descrição copiada.');
    } catch {
      toast.error('Não foi possível copiar.');
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
      toast.errors(['O nome é obrigatório.']);
      return;
    }
    onSave(item.id, { name: name.trim(), description: description.trim() });
    setEditing(false);
  }

  return (
    <div className="rounded-lg border border-edge bg-surface">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 px-3 py-2.5">
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

        {/* Ações */}
        <div className="flex shrink-0 items-center gap-1">
          {onComplete && (
            <IconButton
              onClick={() => onComplete(item.id)}
              aria-label="Concluir"
              title="Concluir"
            >
              <CheckIcon className="h-5 w-5" />
            </IconButton>
          )}
          {onReopen && (
            <IconButton
              onClick={() => onReopen(item.id)}
              aria-label="Reabrir"
              title="Reabrir"
            >
              <UndoIcon className="h-5 w-5" />
            </IconButton>
          )}
          <IconButton onClick={startEdit} aria-label="Editar" title="Editar">
            <PencilIcon className="h-5 w-5" />
          </IconButton>
          <IconButton
            onClick={() => onDelete(item.id)}
            aria-label="Excluir"
            title="Excluir"
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
                  placeholder="Nome"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={inputClass}
                  placeholder="Descrição"
                />
                <div className="flex gap-2">
                  <Button onClick={saveEdit}>Salvar</Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditing(false)}
                  >
                    Cancelar
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
                  <p className="text-sm text-fg-subtle">Sem descrição.</p>
                )}
                {item.description && (
                  <Button
                    variant="secondary"
                    onClick={() => void copyDescription()}
                    className="self-start"
                  >
                    <CopyIcon className="h-4 w-4" />
                    Copiar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
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
