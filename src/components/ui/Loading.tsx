import { cn } from '@/utils/cn';

interface LoadingProps {
  label?: string;
  /** Sobrescreve a área (altura). Padrão: ocupa ~meia tela e centraliza. */
  className?: string;
}

/**
 * Indicador de carregamento padrão: spinner + rótulo, centralizado na área.
 * Use em todos os estados de "carregando" do app.
 */
export function Loading({ label = 'Carregando...', className }: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 text-fg-muted',
        className,
      )}
    >
      <span
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-2 border-edge border-t-edge-inverse"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
