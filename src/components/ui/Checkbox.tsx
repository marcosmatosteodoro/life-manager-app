'use client';

import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

/** Checkbox simples com rótulo, reutilizável. */
export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-surface-muted',
        props.disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-edge-strong text-fg accent-fg"
        {...props}
      />
      <span className="text-sm text-fg">{label}</span>
    </label>
  );
}
