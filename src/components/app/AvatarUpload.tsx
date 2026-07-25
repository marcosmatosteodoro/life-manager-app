'use client';

import { type ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToastStore';
import { compressImage, type CompressedImage } from '@/utils/image';

interface AvatarUploadProps {
  /** Data URL da foto atual, ou null quando não há. */
  src: string | null;
  alt: string;
  /** Conteúdo mostrado quando não há foto (inicial, ícone...). */
  fallback?: ReactNode;
  /** Desabilita ações enquanto o pai persiste (upload/remover). */
  busy?: boolean;
  onPick: (image: CompressedImage) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
}

/** Foto de perfil (única): avatar redondo + escolher/trocar/remover. */
export function AvatarUpload({
  src,
  alt,
  fallback,
  busy,
  onPick,
  onRemove,
}: AvatarUploadProps) {
  const { t } = useTranslation('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  async function handleFile(file: File | undefined | null) {
    if (!file || !file.type.startsWith('image/')) return;
    setProcessing(true);
    try {
      await onPick(await compressImage(file));
    } catch {
      toast.errors([t('avatar.loadError')]);
    } finally {
      setProcessing(false);
    }
  }

  const disabled = busy || processing;

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-edge bg-surface-subtle text-2xl text-fg-subtle">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden>{fallback ?? '👤'}</span>
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {processing
            ? t('saving')
            : src
              ? t('avatar.change')
              : t('avatar.add')}
        </Button>
        {src && onRemove && (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => void onRemove()}
          >
            {t('avatar.remove')}
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
