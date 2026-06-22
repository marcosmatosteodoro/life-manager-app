'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/** Botão quadrado para ícones — simples e reutilizável (sem regra de negócio). */
export function IconButton({ className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition-colors',
        'hover:bg-neutral-100 hover:text-neutral-900',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
