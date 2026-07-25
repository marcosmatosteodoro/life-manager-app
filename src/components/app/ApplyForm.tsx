'use client';

import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import {
  ADVICE_STATUSES,
  type AdviceStatus,
  type Apply,
  type ApplyInput,
  type ApplyStatus,
} from '@/services/apply.types';
import { APPLY_STATUSES } from '@/services/applyService';
import type { Company } from '@/services/company.types';

const STATUS_KEYS = APPLY_STATUSES;

interface ApplyFormProps {
  initial?: Apply | null;
  /** Valores iniciais ao criar (ex.: vindos de uma vaga do buscador). */
  prefill?: Partial<Apply>;
  companies: Company[];
  submitting: boolean;
  onSubmit: (input: ApplyInput) => void;
  onCancel: () => void;
}

function currentDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function ApplyForm({
  initial,
  prefill,
  companies,
  submitting,
  onSubmit,
  onCancel,
}: ApplyFormProps) {
  const { t } = useTranslation(['jobs', 'common']);
  const [name, setName] = useState(initial?.name ?? prefill?.name ?? '');
  const [companyId, setCompanyId] = useState(
    initial?.companyId != null ? String(initial.companyId) : '',
  );
  const [status, setStatus] = useState<ApplyStatus>(
    initial?.status ?? prefill?.status ?? 'APPLIED',
  );
  const [date, setDate] = useState(
    initial?.date ?? prefill?.date ?? currentDate(),
  );
  const [link, setLink] = useState(initial?.link ?? prefill?.link ?? '');
  const [description, setDescription] = useState(
    initial?.description ?? prefill?.description ?? '',
  );
  // Conselho da extensão (vazio = não avaliado), motivo e flag humano.
  const [adviceStatus, setAdviceStatus] = useState(
    initial?.adviceStatus != null
      ? String(initial.adviceStatus)
      : prefill?.adviceStatus != null
        ? String(prefill.adviceStatus)
        : '',
  );
  const [decisionDescription, setDecisionDescription] = useState(
    initial?.decisionDescription ?? prefill?.decisionDescription ?? '',
  );
  const [isHuman, setIsHuman] = useState(initial?.isHuman ?? true);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      companyId: Number(companyId),
      status,
      date,
      link: link.trim() ? link.trim() : null,
      description: description.trim() ? description.trim() : null,
      isHuman,
      adviceStatus: adviceStatus
        ? (Number(adviceStatus) as AdviceStatus)
        : null,
      decisionDescription: decisionDescription.trim()
        ? decisionDescription.trim()
        : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t('applyForm.name')} htmlFor="name">
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('applyForm.namePlaceholder')}
          className={inputClass}
        />
      </Field>

      <Field label={t('applyForm.company')} htmlFor="companyId">
        <select
          id="companyId"
          required
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            {t('applyForm.companyDefault')}
          </option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t('applyForm.status')} htmlFor="status">
          <select
            id="status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplyStatus)}
            className={inputClass}
          >
            {STATUS_KEYS.map((value) => (
              <option key={value} value={value}>
                {t(`jobs:applyStatus.${value}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('applyForm.date')} htmlFor="date">
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label={t('applyForm.link')} htmlFor="link">
        <input
          id="link"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder={t('applyForm.linkPlaceholder')}
          className={inputClass}
        />
      </Field>

      <Field label={t('applyForm.description')} htmlFor="description">
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label={t('applyForm.adviceStatus')} htmlFor="adviceStatus">
        <select
          id="adviceStatus"
          value={adviceStatus}
          onChange={(e) => setAdviceStatus(e.target.value)}
          className={inputClass}
        >
          <option value="">{t('applyForm.adviceNone')}</option>
          {ADVICE_STATUSES.map((value) => (
            <option key={value} value={value}>
              {t(`advice.${value}`)}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t('applyForm.decisionDescription')} htmlFor="decisionDescription">
        <textarea
          id="decisionDescription"
          rows={2}
          value={decisionDescription}
          onChange={(e) => setDecisionDescription(e.target.value)}
          placeholder={t('applyForm.decisionPlaceholder')}
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-fg-soft">
        <input
          type="checkbox"
          checked={isHuman}
          onChange={(e) => setIsHuman(e.target.checked)}
          className="h-4 w-4"
        />
        {t('applyForm.isHuman')}
      </label>

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          {t('common:cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? t('applyForm.saving')
            : initial
              ? t('applyForm.save')
              : t('applyForm.create')}
        </Button>
      </div>
    </form>
  );
}
