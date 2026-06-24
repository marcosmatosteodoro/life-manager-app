'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ComponentType, type SVGProps, useEffect } from 'react';
import { IconButton } from '@/components/ui/IconButton';
import { useSidebarStore } from '@/hooks/useSidebarStore';
import { cn } from '@/utils/cn';

type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const MAIN_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', Icon: HomeIcon },
  {
    href: '/gerenciamento-de-peso',
    label: 'Gerenciamento de Peso',
    Icon: ScaleIcon,
  },
  {
    href: '/estudando-ingles',
    label: 'Estudando Inglês',
    Icon: BookIcon,
  },
  {
    href: '/consistencia',
    label: 'Consistência',
    Icon: CheckIcon,
  },
  {
    href: '/cronometro',
    label: 'Cronômetro',
    Icon: ClockIcon,
  },
];

const VAGAS_ITEMS: NavItem[] = [
  { href: '/vagas/paises', label: 'Países', Icon: GlobeIcon },
  { href: '/vagas/empresas', label: 'Empresas', Icon: BuildingIcon },
  { href: '/vagas/aplicacoes', label: 'Aplicações', Icon: SendIcon },
  { href: '/vagas/buscador', label: 'Buscador de vagas', Icon: SearchIcon },
  { href: '/vagas/aplicador', label: 'Aplicador de vagas', Icon: BoltIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggle = useSidebarStore((state) => state.toggle);
  const mobileOpen = useSidebarStore((state) => state.mobileOpen);
  const toggleMobile = useSidebarStore((state) => state.toggleMobile);
  const closeMobile = useSidebarStore((state) => state.closeMobile);

  // Fecha o drawer mobile sempre que a rota muda.
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  function renderItem(
    { href, label, Icon }: NavItem,
    opts: { iconOnly?: boolean; onClick?: () => void } = {},
  ) {
    // '/' só fica ativo na rota exata; demais usam prefixo.
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        onClick={opts.onClick}
        title={opts.iconOnly ? label : undefined}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          opts.iconOnly && 'justify-center px-0',
          active
            ? 'bg-neutral-900 text-white'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!opts.iconOnly && <span className="truncate">{label}</span>}
      </Link>
    );
  }

  return (
    <>
      {/* ===== Desktop: sidebar no fluxo, recolhível (>= md) ===== */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-white transition-[width] duration-200 ease-in-out md:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <nav className="flex flex-col gap-1 px-2 pt-3">
          {MAIN_ITEMS.map((item) => renderItem(item, { iconOnly: collapsed }))}
        </nav>

        <div className="mt-4 px-2">
          {collapsed ? (
            <div className="mx-2 border-t border-neutral-200" />
          ) : (
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Vagas
            </p>
          )}
          <nav className="flex flex-col gap-1 pt-1">
            {VAGAS_ITEMS.map((item) => renderItem(item, { iconOnly: collapsed }))}
          </nav>
        </div>

        <div
          className={cn(
            'mt-auto flex h-12 items-center px-3',
            collapsed ? 'justify-center' : 'justify-end',
          )}
        >
          <IconButton
            onClick={toggle}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!collapsed}
          >
            <ChevronIcon
              className={cn(
                'h-5 w-5 transition-transform duration-200',
                collapsed && 'rotate-180',
              )}
            />
          </IconButton>
        </div>
      </aside>

      {/* ===== Mobile: botão flutuante (só a seta embaixo) (< md) ===== */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Abrir menu"
          className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-lg transition-transform active:scale-95 md:hidden"
        >
          <ChevronIcon className="h-5 w-5 -rotate-90" />
        </button>
      )}

      {/* ===== Mobile: drawer em tela cheia (bloqueia o resto) ===== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
          <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
            <span className="text-lg font-semibold tracking-tight text-neutral-900">
              Menu
            </span>
            <IconButton onClick={closeMobile} aria-label="Fechar menu">
              <CloseIcon className="h-5 w-5" />
            </IconButton>
          </div>
          <nav className="flex flex-col gap-1 overflow-y-auto p-3">
            {MAIN_ITEMS.map((item) => renderItem(item, { onClick: closeMobile }))}
            <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Vagas
            </p>
            {VAGAS_ITEMS.map((item) => renderItem(item, { onClick: closeMobile }))}
          </nav>
        </div>
      )}
    </>
  );
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function ScaleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3v18" />
      <path d="M5 21h14" />
      <path d="M5 7h14" />
      <path d="m5 7-3 6a3 3 0 0 0 6 0L5 7Z" />
      <path d="m19 7-3 6a3 3 0 0 0 6 0l-3-6Z" />
    </svg>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
    </svg>
  );
}

function BuildingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="4" y="3" width="12" height="18" rx="1" />
      <path d="M16 8h4v13H4" />
      <path d="M8 7h0M12 7h0M8 11h0M12 11h0M8 15h0M12 15h0" />
    </svg>
  );
}

function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BoltIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  );
}

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}
