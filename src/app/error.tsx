'use client'; // Error boundaries precisam ser Client Components.

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * Boundary de erro de runtime (o "500" do App Router): captura erros lançados
 * ao renderizar um segmento de rota e mostra um fallback com opção de tentar
 * de novo. Não cobre erros do layout raiz — para isso existiria `global-error`.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Log no console; em produção o digest ajuda a casar com o log do servidor.
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center text-center">
      <span className="text-5xl font-semibold tracking-tight text-neutral-300">
        500
      </span>
      <h1 className="mt-4 text-xl font-semibold text-neutral-900">
        Algo deu errado
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Ocorreu um erro inesperado ao carregar esta página. Tente novamente.
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-neutral-400">
          Código de referência: {error.digest}
        </p>
      )}
      <div className="mt-6 flex items-center gap-2">
        <Button onClick={() => unstable_retry()}>Tentar novamente</Button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
        >
          Início
        </Link>
      </div>
    </section>
  );
}
