import Image from 'next/image';
import Link from 'next/link';
import { HeaderMenu } from './HeaderMenu';
import { LogoutButton } from './LogoutButton';
import { RunningTimersIndicator } from './RunningTimersIndicator';
import { ThemeToggle } from './ThemeToggle';

/** Cabeçalho com o logo + nome do app linkando para a página principal. */
export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-edge bg-surface/80 px-4 backdrop-blur">
      <Link
        href="/"
        className="flex items-center gap-2 transition-opacity hover:opacity-70"
      >
        <Image
          src="/logo.png"
          alt="Life Manager"
          width={32}
          height={32}
          priority
          className="h-8 w-8 rounded-md object-contain"
        />
        <span className="text-lg font-semibold tracking-tight text-fg">
          Life Manager
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <RunningTimersIndicator />
        {/* Desktop: ações inline. */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <LogoutButton />
        </div>
        {/* Mobile: menu hambúrguer com tema + sair. */}
        <div className="md:hidden">
          <HeaderMenu />
        </div>
      </div>
    </header>
  );
}
