'use client'; // Error boundaries precisam ser Client Components.

import { Geist, Geist_Mono } from 'next/font/google';
import { useEffect } from 'react';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/**
 * Último recurso: captura erros que estouram no próprio layout raiz (que o
 * `error.tsx` não cobre). Substitui o layout inteiro, então precisa do próprio
 * `<html>/<body>`, do CSS global e das fontes — não há `AppShell` aqui.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <section className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 text-center">
          <span className="text-5xl font-semibold tracking-tight text-neutral-300">
            500
          </span>
          <h1 className="mt-4 text-xl font-semibold text-neutral-900">
            Algo deu errado
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Ocorreu um erro inesperado no aplicativo. Tente novamente.
          </p>
          {error.digest && (
            <p className="mt-1 text-xs text-neutral-400">
              Código de referência: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-6 inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Tentar novamente
          </button>
        </section>
      </body>
    </html>
  );
}
