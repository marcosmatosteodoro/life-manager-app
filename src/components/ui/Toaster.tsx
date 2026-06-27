'use client';

import { useEffect } from 'react';
import { type Toast, useToastStore } from '@/hooks/useToastStore';
import { cn } from '@/utils/cn';

/** Renderiza os toasts ativos no canto da tela. */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-[80vw] flex-col gap-2 sm:max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm',
        toast.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-800',
      )}
    >
      <span className="min-w-0 break-words whitespace-pre-line">
        {toast.message}
      </span>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Fechar"
        className="shrink-0 text-current opacity-60 transition-opacity hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
