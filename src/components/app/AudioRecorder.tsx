'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToastStore';

// Limite de bytes do áudio: base64 infla ~33% e a Vercel corta o corpo em ~4,5 MB;
// ~2,2 MB de áudio ≈ ~3 MB de base64, com folga.
const MAX_BYTES = 2_200_000;

interface AudioRecorderProps {
  /** Recebe o áudio em base64 (sem prefixo) + mimeType para persistir. */
  onSave: (audio: { data: string; mimeType: string }) => void | Promise<void>;
  saving?: boolean;
  /** Rótulo do botão de gravar (ex.: "Gravar" ou "Regravar"). */
  recordLabel?: string;
  onCancel?: () => void;
}

/** Gravador de nota de voz (MediaRecorder): gravar → ouvir → salvar/descartar. */
export function AudioRecorder({
  onSave,
  saving,
  recordLabel,
  onCancel,
}: AudioRecorderProps) {
  const { t } = useTranslation(['backlog', 'common']);
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Libera o object URL do preview ao trocar/desmontar.
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  async function startRecording() {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices) {
      toast.errors([t('backlog:audio.unsupported')]);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const recorded = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        setBlob(recorded);
        setUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(recorded);
        });
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      toast.errors([t('backlog:audio.permissionDenied')]);
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  function discard() {
    setBlob(null);
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  async function save() {
    if (!blob) return;
    if (blob.size > MAX_BYTES) {
      toast.errors([t('backlog:audio.tooLarge')]);
      return;
    }
    const data = await blobToBase64(blob);
    await onSave({ data, mimeType: blob.type || 'audio/webm' });
    discard();
  }

  return (
    <div className="flex flex-col gap-2">
      {recording ? (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm text-red-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
            {t('backlog:audio.recording')}
          </span>
          <Button variant="secondary" onClick={stopRecording}>
            {t('backlog:audio.stop')}
          </Button>
        </div>
      ) : blob ? (
        <div className="flex flex-col gap-2">
          {url && <audio controls src={url} className="w-full" />}
          <div className="flex gap-2">
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? t('common:saving') : t('backlog:audio.save')}
            </Button>
            <Button variant="secondary" onClick={discard} disabled={saving}>
              {t('backlog:audio.discard')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void startRecording()}>
            {recordLabel ?? t('backlog:audio.record')}
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              {t('common:cancel')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/** Blob → base64 puro (sem o prefixo `data:...;base64,`). */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.readAsDataURL(blob);
  });
}
