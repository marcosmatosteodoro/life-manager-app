'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/utils/cn';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

/** Menu de 3 pontinhos (kebab) com fechamento por clique fora / ESC. */
export function DropdownMenu({
  items,
  ariaLabel = 'Ações',
  icon,
}: {
  items: DropdownItem[];
  ariaLabel?: string;
  /** Ícone do gatilho. Padrão: kebab (3 pontinhos). */
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <IconButton
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        {icon ?? <DotsIcon className="h-5 w-5" />}
      </IconButton>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-md border border-edge bg-surface py-1 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick();
              }}
              className={cn(
                'block w-full px-3 py-2 text-left text-sm transition-colors',
                item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-fg-soft hover:bg-surface-subtle',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DotsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}
