import Image from 'next/image';
import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

/** Cabeçalho com o logo + nome do app linkando para a página principal. */
export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/80 px-4 backdrop-blur">
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
        <span className="text-lg font-semibold tracking-tight text-neutral-900">
          Life Manager
        </span>
      </Link>
      <LogoutButton />
    </header>
  );
}
