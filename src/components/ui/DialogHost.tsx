'use client';

import { useTranslation } from 'react-i18next';
import { useDialogStore } from '@/hooks/useDialogStore';
import { Button } from './Button';
import { Modal } from './Modal';

/**
 * Renderiza o diálogo imperativo atual (confirm/alert) do `useDialogStore`.
 * Montado uma vez no AppShell, junto do Toaster. Substitui os
 * `window.confirm`/`alert` nativos por um componente próprio.
 */
export function DialogHost() {
  const { t } = useTranslation('common');
  const current = useDialogStore((s) => s.current);
  const settle = useDialogStore((s) => s.settle);

  const isDanger = current?.tone === 'danger';
  const isAlert = current?.kind === 'alert';

  return (
    // ESC / clique fora = cancelar (no alert, apenas fecha).
    <Modal
      open={current !== null}
      title={current?.title ?? ''}
      onClose={() => settle(false)}
    >
      {current?.description ? (
        <p className="text-sm whitespace-pre-line text-fg-muted">
          {current.description}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end gap-2">
        {!isAlert && (
          <Button variant="secondary" onClick={() => settle(false)}>
            {current?.cancelLabel ?? t('cancel')}
          </Button>
        )}
        <Button
          variant={isDanger ? 'danger' : 'primary'}
          onClick={() => settle(true)}
          autoFocus
        >
          {current?.confirmLabel ?? (isAlert ? t('ok') : t('confirm'))}
        </Button>
      </div>
    </Modal>
  );
}
