'use client';

import type { ReactNode } from 'react';

/** Classe base compartilhada por inputs/selects/textarea das telas. */
export const inputClass =
  'w-full rounded-md border border-edge-strong px-3 py-2 text-sm text-fg outline-none transition-colors focus:border-edge-inverse disabled:bg-surface-subtle disabled:text-fg-subtle';

/** Rótulo + campo, layout vertical consistente. */
export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fg-soft">{label}</span>
      {children}
    </label>
  );
}
