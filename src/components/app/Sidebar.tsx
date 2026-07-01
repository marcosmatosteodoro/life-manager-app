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

// Grupo de navegação; `label` ausente = itens soltos (sem cabeçalho).
type NavGroup = { label?: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { href: '/', label: 'Home', Icon: HomeIcon },
      { href: '/cronometro', label: 'Cronômetro', Icon: ClockIcon },
      { href: '/pomodoro', label: 'Pomodoro', Icon: PomodoroIcon },
      { href: '/afazeres', label: 'Afazeres', Icon: ListCheckIcon },
      { href: '/backlog', label: 'Próximos passos', Icon: RoadmapIcon },
      { href: '/conversores', label: 'Conversores', Icon: SwapIcon },
    ],
  },
  {
    label: 'Estudos',
    items: [
      { href: '/estudando-ingles', label: 'Artigos', Icon: BookIcon },
      { href: '/revisar', label: 'Flashcards', Icon: CardsIcon },
    ],
  },
  {
    label: 'Sobre mim',
    items: [
      { href: '/diario', label: 'Diário', Icon: JournalIcon },
      {
        href: '/diario-de-gratidao',
        label: 'Gratidão',
        Icon: HeartIcon,
      },
      { href: '/feedback', label: 'Feedback', Icon: SparklesIcon },
      {
        href: '/gerenciamento-de-peso',
        label: 'Peso',
        Icon: ScaleIcon,
      },
    ],
  },
  {
    label: 'Vagas',
    items: [
      { href: '/vagas/paises', label: 'Países', Icon: GlobeIcon },
      { href: '/vagas/empresas', label: 'Empresas', Icon: BuildingIcon },
      { href: '/vagas/aplicacoes', label: 'Candidaturas', Icon: SendIcon },
      { href: '/vagas/buscador', label: 'Buscar vagas', Icon: SearchIcon },
      { href: '/vagas/aplicador', label: 'Aplicador', Icon: BoltIcon },
    ],
  },
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
    // Ativo só no match exato ou em sub-rota (href + '/'), nunca em prefixo
    // parcial — evita que '/diario' acenda junto com '/diario-de-gratidao'.
    const active = pathname === href || pathname.startsWith(`${href}/`);
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
            ? 'bg-surface-inverse text-surface'
            : 'text-fg-muted hover:bg-surface-subtle hover:text-fg',
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!opts.iconOnly && <span className="truncate">{label}</span>}
      </Link>
    );
  }

  function renderGroup(
    group: NavGroup,
    index: number,
    opts: { iconOnly?: boolean; onClick?: () => void } = {},
  ) {
    return (
      <div key={group.label ?? index} className={index === 0 ? '' : 'mt-4'}>
        {group.label &&
          (opts.iconOnly ? (
            // Recolhido: só um divisor entre grupos (sem texto).
            <div className="mx-2 border-t border-edge" />
          ) : (
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-fg-subtle">
              {group.label}
            </p>
          ))}
        <nav className="flex flex-col gap-1 pt-1">
          {group.items.map((item) => renderItem(item, opts))}
        </nav>
      </div>
    );
  }

  return (
    <>
      {/* ===== Desktop: sidebar no fluxo, recolhível (>= md) ===== */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col overflow-y-auto border-r border-edge bg-surface transition-[width] duration-200 ease-in-out md:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <div className="flex flex-col px-2 pt-3">
          {NAV_GROUPS.map((group, i) =>
            renderGroup(group, i, { iconOnly: collapsed }),
          )}
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
          className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-edge bg-surface text-fg-soft shadow-lg transition-transform active:scale-95 md:hidden"
        >
          <ChevronIcon className="h-5 w-5 -rotate-90" />
        </button>
      )}

      {/* ===== Mobile: drawer em tela cheia (bloqueia o resto) ===== */}
      {mobileOpen && (
        <div className="animate-slide-in-left fixed inset-0 z-50 flex flex-col bg-surface md:hidden">
          <div className="flex h-14 items-center justify-between border-b border-edge px-4">
            <span className="text-lg font-semibold tracking-tight text-fg">
              Menu
            </span>
            <IconButton onClick={closeMobile} aria-label="Fechar menu">
              <CloseIcon className="h-5 w-5" />
            </IconButton>
          </div>
          <div className="flex flex-col overflow-y-auto p-3 pb-20">
            {NAV_GROUPS.map((group, i) =>
              renderGroup(group, i, { onClick: closeMobile }),
            )}
          </div>

          {/* Seta flutuante embaixo à direita para fechar (além do X no topo). */}
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Fechar menu"
            className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-edge bg-surface text-fg-soft shadow-lg transition-transform active:scale-95"
          >
            <ChevronIcon className="h-5 w-5 rotate-90" />
          </button>
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

function SparklesIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" />
      <path d="M18 14l.9 2.3 2.3.9-2.3.9L18 20.4l-.9-2.3-2.3-.9 2.3-.9L18 14Z" />
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

function CardsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="7" width="13" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-2" />
    </svg>
  );
}

function JournalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5Z" />
      <path d="M9 3v18" />
      <path d="M13 8h3M13 12h3" />
    </svg>
  );
}

function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 12 6 4.5 4.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7 7-7Z" />
    </svg>
  );
}

function PomodoroIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 5c-4.4 0-8 3.4-8 7.5S7.6 21 12 21s8-3.9 8-8.5S16.4 5 12 5Z" />
      <path d="M12 5c0-1.5 1-2.5 2.5-2.5" />
      <path d="M12 5c0-1.5-1-2.5-2.5-2.5" />
    </svg>
  );
}

function ListCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m3 7 2 2 3-3" />
      <path d="m3 17 2 2 3-3" />
      <path d="M12 7h9" />
      <path d="M12 17h9" />
    </svg>
  );
}

function RoadmapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 6h10" />
      <path d="M4 12h16" />
      <path d="M4 18h7" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="15" cy="18" r="2" />
    </svg>
  );
}

function SwapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M7 4 3 8l4 4" />
      <path d="M3 8h13a4 4 0 0 1 0 8h-1" />
      <path d="m17 20 4-4-4-4" />
      <path d="M21 16H8a4 4 0 0 1 0-8h1" />
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
