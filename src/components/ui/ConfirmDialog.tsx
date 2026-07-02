'use client';

import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Diálogo de confirmação reutilizável (ex.: antes de excluir). */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation('common');
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-fg-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {t('cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? t('deleting') : (confirmLabel ?? t('confirm'))}
        </Button>
      </div>
    </Modal>
  );
}
