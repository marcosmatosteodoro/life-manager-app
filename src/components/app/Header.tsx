import Link from 'next/link';

/** Cabeçalho com o nome do app linkando para a página principal. */
export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center border-b border-neutral-200 bg-white/80 px-4 backdrop-blur">
      <Link
        href="/"
        className="text-lg font-semibold tracking-tight text-neutral-900 transition-opacity hover:opacity-70"
      >
        Life Manager
      </Link>
    </header>
  );
}
