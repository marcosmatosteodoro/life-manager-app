'use client';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToastStore';
import { compressImage } from '@/utils/image';

/** Foto ainda não salva (base64 + preview data URL). */
export interface PendingPhoto {
  id: string;
  data: string;
  mimeType: string;
  preview: string;
}

/** Foto já salva no back (id + data URL para exibir). */
export interface ExistingPhoto {
  id: number;
  url: string;
}

interface PhotoPickerProps {
  pending: PendingPhoto[];
  existing: ExistingPhoto[];
  onAddPending: (photo: PendingPhoto) => void;
  onRemovePending: (id: string) => void;
  onRemoveExisting: (id: number) => void;
}

/** Adiciona fotos por drag & drop, escolha de arquivo ou câmera; com previews. */
export function PhotoPicker({
  pending,
  existing,
  onAddPending,
  onRemovePending,
  onRemoveExisting,
}: PhotoPickerProps) {
  const { t } = useTranslation(['expenses', 'common']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | File[] | null) {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) return;
    setBusy(true);
    try {
      for (let i = 0; i < images.length; i++) {
        const { data, mimeType } = await compressImage(images[i]);
        onAddPending({
          id: `${Date.now()}-${i}-${data.length}`,
          data,
          mimeType,
          preview: `data:${mimeType};base64,${data}`,
        });
      }
    } catch {
      toast.errors([t('expenses:photos.readError')]);
    } finally {
      setBusy(false);
    }
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.errors([t('expenses:photos.cameraUnsupported')]);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraOn(true);
      // O <video> monta no próximo render; atribui a stream em seguida.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      toast.errors([t('expenses:photos.cameraDenied')]);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((tk) => tk.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9),
    );
    if (blob) {
      await handleFiles([
        new File([blob], 'foto.jpg', { type: 'image/jpeg' }),
      ]);
    }
    stopCamera();
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-fg-soft">
        {t('expenses:form.photos')}
      </span>

      {cameraOn ? (
        <div className="flex flex-col gap-2">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full rounded-md border border-edge bg-black"
          />
          <div className="flex gap-2">
            <Button type="button" onClick={() => void capture()}>
              {t('expenses:photos.capture')}
            </Button>
            <Button type="button" variant="secondary" onClick={stopCamera}>
              {t('common:cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-md border border-dashed px-4 py-6 text-center text-sm transition-colors ${
              dragOver
                ? 'border-edge-inverse bg-surface-subtle text-fg'
                : 'border-edge-strong text-fg-muted'
            }`}
          >
            {busy ? t('expenses:photos.processing') : t('expenses:photos.drop')}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => void startCamera()}
            className="self-start"
          >
            {t('expenses:photos.takePhoto')}
          </Button>
        </>
      )}

      {(existing.length > 0 || pending.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {existing.map((p) => (
            <Thumb
              key={`e-${p.id}`}
              src={p.url}
              onRemove={() => onRemoveExisting(p.id)}
              removeLabel={t('common:delete')}
            />
          ))}
          {pending.map((p) => (
            <Thumb
              key={p.id}
              src={p.preview}
              onRemove={() => onRemovePending(p.id)}
              removeLabel={t('common:delete')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Thumb({
  src,
  onRemove,
  removeLabel,
}: {
  src: string;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-16 w-16 rounded-md border border-edge object-cover"
      />
      <Button
        variant="secondary"
        onClick={onRemove}
        className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
        aria-label={removeLabel}
      >
        ×
      </Button>
    </div>
  );
}
