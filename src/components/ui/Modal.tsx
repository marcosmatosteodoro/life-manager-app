'use client';

import { type ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Modal genérico com overlay, fechamento por ESC e clique fora. */
export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-xl bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="shrink-0 px-6 pt-6 text-lg font-semibold text-fg">{title}</h2>
        <div className="overflow-y-auto px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}
