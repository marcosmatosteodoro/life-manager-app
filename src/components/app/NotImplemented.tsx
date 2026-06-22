/** Placeholder para recursos ainda não implementados. */
export function NotImplemented({ title }: { title: string }) {
  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        {title}
      </h1>
      <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 px-4 py-16 text-center">
        <span aria-hidden className="text-3xl">
          🚧
        </span>
        <p className="text-sm font-medium text-neutral-700">
          Ainda não implementado
        </p>
        <p className="text-sm text-neutral-500">
          Este recurso estará disponível em breve.
        </p>
      </div>
    </section>
  );
}
