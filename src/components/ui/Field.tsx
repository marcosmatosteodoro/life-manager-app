'use client';

import type { ReactNode } from 'react';

/** Classe base compartilhada por inputs/selects/textarea das telas. */
export const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 disabled:bg-neutral-100 disabled:text-neutral-400';

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
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
