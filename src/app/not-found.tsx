import Link from 'next/link';

/**
 * 404 — renderizado para URLs que não casam com nenhuma rota e quando algum
 * segmento chama `notFound()`. Server Component (sem props).
 */
export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center text-center">
      <span className="text-5xl font-semibold tracking-tight text-neutral-300">
        404
      </span>
      <h1 className="mt-4 text-xl font-semibold text-neutral-900">
        Página não encontrada
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        O endereço que você tentou abrir não existe ou foi movido.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
      >
        Voltar para o início
      </Link>
    </section>
  );
}
