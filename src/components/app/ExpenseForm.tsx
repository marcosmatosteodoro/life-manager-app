'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { toast } from '@/hooks/useToastStore';
import { ApiError, expenseService } from '@/services/expenseService';
import { EXPENSE_TYPES } from '@/services/expenseService';
import type {
  Expense,
  ExpenseAudio,
  ExpenseCategory,
  ExpenseType,
} from '@/services/expense.types';
import { AudioRecorder } from './AudioRecorder';
import {
  type ExistingPhoto,
  type PendingPhoto,
  PhotoPicker,
} from './PhotoPicker';

const pad = (n: number) => String(n).padStart(2, '0');
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

interface ExpenseFormProps {
  initial?: Expense | null;
  categories: ExpenseCategory[];
  onSaved: () => void;
  onCancel: () => void;
}

/** Cadastro/edição de um gasto (persiste o gasto e o áudio). */
export function ExpenseForm({
  initial,
  categories,
  onSaved,
  onCancel,
}: ExpenseFormProps) {
  const { t } = useTranslation(['expenses', 'common']);
  // Parcela existente (edição): nº de parcelas é fixo, não reeditável.
  const isParcel = Boolean(initial?.parcelNumber);
  const [type, setType] = useState<ExpenseType>(initial?.type ?? 'debito');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [value, setValue] = useState(initial ? String(initial.value) : '');
  const [installments, setInstallments] = useState(
    initial?.installments != null ? String(initial.installments) : '',
  );
  const [categoryName, setCategoryName] = useState(
    initial?.category?.name ?? '',
  );
  const [date, setDate] = useState(initial?.date ?? today());
  const [description, setDescription] = useState(initial?.description ?? '');

  // Áudio: gravação pendente (salva após o gasto) ou remoção do existente.
  const [pendingAudio, setPendingAudio] = useState<ExpenseAudio | null>(null);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  // Fotos: pendentes (novas) + existentes (edição) + ids removidos.
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<number[]>([]);

  const [submitting, setSubmitting] = useState(false);

  // Em edição com fotos, carrega as existentes para exibir/remover.
  useEffect(() => {
    if (!initial?.id || !initial.photoCount) return;
    let active = true;
    void expenseService
      .listPhotos(initial.id)
      .then((photos) => {
        if (active) {
          setExistingPhotos(
            photos.map((p) => ({
              id: p.id,
              url: `data:${p.mimeType};base64,${p.data}`,
            })),
          );
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [initial?.id, initial?.photoCount]);

  function errors(error: unknown): string[] {
    return error instanceof ApiError
      ? error.messages
      : [t('common:unexpectedError')];
  }

  async function playExisting() {
    if (!initial) return;
    try {
      const audio = await expenseService.getAudio(initial.id);
      setAudioSrc(`data:${audio.mimeType};base64,${audio.data}`);
    } catch (error) {
      toast.errors(errors(error));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const input = {
        title: title.trim(),
        value: Number(value),
        type,
        installments:
          type === 'credito' && installments ? Number(installments) : undefined,
        date,
        // Sempre envia (vazio limpa a categoria na edição).
        categoryName: categoryName.trim(),
        description: description.trim() ? description.trim() : null,
      };
      const saved = initial
        ? await expenseService.update(initial.id, input)
        : await expenseService.create(input);

      if (pendingAudio) {
        await expenseService.setAudio(saved.id, pendingAudio);
      } else if (removeAudio && initial?.hasAudio) {
        await expenseService.removeAudio(saved.id);
      }

      // Fotos: remove as descartadas e envia as novas (uma por request).
      for (const photoId of removedPhotoIds) {
        await expenseService.removePhoto(saved.id, photoId);
      }
      for (const photo of pendingPhotos) {
        await expenseService.addPhoto(saved.id, {
          data: photo.data,
          mimeType: photo.mimeType,
        });
      }

      toast.success(initial ? t('expenses:updated') : t('expenses:created'));
      onSaved();
    } catch (error) {
      toast.errors(errors(error));
    } finally {
      setSubmitting(false);
    }
  }

  const hasExistingAudio = Boolean(initial?.hasAudio);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('expenses:form.type')} htmlFor="exp-type">
          <select
            id="exp-type"
            value={type}
            onChange={(e) => setType(e.target.value as ExpenseType)}
            className={inputClass}
          >
            {EXPENSE_TYPES.map((v) => (
              <option key={v} value={v}>
                {t(`expenses:type.${v}`)}
              </option>
            ))}
          </select>
        </Field>
        {type === 'credito' &&
          (isParcel ? (
            <Field label={t('expenses:form.installments')} htmlFor="exp-inst">
              <p
                id="exp-inst"
                className="px-1 py-2 text-sm text-fg-muted"
              >
                {initial?.parcelNumber}/{initial?.installments}
              </p>
            </Field>
          ) : (
            <Field label={t('expenses:form.installments')} htmlFor="exp-inst">
              <input
                id="exp-inst"
                type="number"
                min={1}
                step={1}
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                placeholder="1"
                className={inputClass}
              />
            </Field>
          ))}
      </div>
      {type === 'credito' && !isParcel && (
        <p className="-mt-2 text-xs text-fg-muted">
          {t('expenses:form.installmentsHint')}
        </p>
      )}

      <Field label={t('expenses:form.title')} htmlFor="exp-title">
        <input
          id="exp-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('expenses:form.titlePlaceholder')}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t('expenses:form.value')} htmlFor="exp-value">
          <input
            id="exp-value"
            type="number"
            step="0.01"
            min="0"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t('expenses:form.date')} htmlFor="exp-date">
          <input
            id="exp-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label={t('expenses:form.category')} htmlFor="exp-cat">
        <input
          id="exp-cat"
          type="text"
          list="expense-categories"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder={t('expenses:form.categoryPlaceholder')}
          className={inputClass}
        />
        <datalist id="expense-categories">
          {categories.map((c) => (
            <option key={c.id} value={c.name} />
          ))}
        </datalist>
      </Field>

      <Field label={t('expenses:form.description')} htmlFor="exp-desc">
        <textarea
          id="exp-desc"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </Field>

      {/* Descrição em áudio (opcional) */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-fg-soft">
          {t('expenses:form.audio')}
        </span>
        {hasExistingAudio && !pendingAudio && !removeAudio && !showRecorder ? (
          <div className="flex flex-col gap-2">
            {audioSrc && <audio controls autoPlay src={audioSrc} className="w-full" />}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void playExisting()}
              >
                {t('expenses:form.listen')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowRecorder(true)}
              >
                {t('expenses:form.rerecord')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setRemoveAudio(true)}
              >
                {t('expenses:form.removeAudio')}
              </Button>
            </div>
          </div>
        ) : pendingAudio ? (
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            {t('expenses:form.audioRecorded')}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingAudio(null)}
            >
              {t('common:cancel')}
            </Button>
          </div>
        ) : removeAudio ? (
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            {t('expenses:form.audioWillRemove')}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRemoveAudio(false)}
            >
              {t('common:cancel')}
            </Button>
          </div>
        ) : (
          <AudioRecorder
            onSave={(a) => {
              setPendingAudio(a);
              setShowRecorder(false);
            }}
            recordLabel={t('expenses:form.recordAudio')}
            onCancel={showRecorder ? () => setShowRecorder(false) : undefined}
          />
        )}
      </div>

      <PhotoPicker
        pending={pendingPhotos}
        existing={existingPhotos}
        onAddPending={(p) => setPendingPhotos((prev) => [...prev, p])}
        onRemovePending={(id) =>
          setPendingPhotos((prev) => prev.filter((p) => p.id !== id))
        }
        onRemoveExisting={(id) => {
          setExistingPhotos((prev) => prev.filter((p) => p.id !== id));
          setRemovedPhotoIds((prev) => [...prev, id]);
        }}
      />

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          {t('common:cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? t('common:saving')
            : initial
              ? t('common:save')
              : t('expenses:form.create')}
        </Button>
      </div>
    </form>
  );
}
