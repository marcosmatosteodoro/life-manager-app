'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

interface Preview {
  url: string;
  name: string;
}

/**
 * Seletor de fotos APENAS visual — mostra previews locais e permite remover.
 * Nada é enviado nem persistido por enquanto (a persistência fica p/ depois).
 */
export function PhotoPicker() {
  const { t } = useTranslation(['expenses', 'common']);
  const [previews, setPreviews] = useState<Preview[]>([]);

  // Libera os object URLs ao desmontar.
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setPreviews((prev) => [...prev, ...next]);
  }

  function remove(index: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-fg-soft">
        {t('expenses:form.photos')}
      </label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => addFiles(e.target.files)}
        className="text-sm text-fg-muted file:mr-3 file:rounded-md file:border file:border-edge file:bg-surface file:px-3 file:py-1.5 file:text-sm file:text-fg"
      />
      <p className="text-xs text-fg-subtle">{t('expenses:form.photosNote')}</p>
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((p, i) => (
            <div key={p.url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.name}
                className="h-16 w-16 rounded-md border border-edge object-cover"
              />
              <Button
                variant="secondary"
                onClick={() => remove(i)}
                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
                aria-label={t('common:delete')}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
