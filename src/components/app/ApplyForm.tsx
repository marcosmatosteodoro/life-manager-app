'use client';

import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import type { Apply, ApplyInput, ApplyStatus } from '@/services/apply.types';
import { APPLY_STATUS_LABELS } from '@/services/applyService';
import type { Company } from '@/services/company.types';

interface ApplyFormProps {
  initial?: Apply | null;
  companies: Company[];
  submitting: boolean;
  onSubmit: (input: ApplyInput) => void;
  onCancel: () => void;
}

const STATUS_OPTIONS = Object.entries(APPLY_STATUS_LABELS) as [
  ApplyStatus,
  string,
][];

function currentDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function ApplyForm({
  initial,
  companies,
  submitting,
  onSubmit,
  onCancel,
}: ApplyFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [companyId, setCompanyId] = useState(
    initial ? String(initial.companyId) : '',
  );
  const [status, setStatus] = useState<ApplyStatus>(
    initial?.status ?? 'APPLIED',
  );
  const [date, setDate] = useState(initial?.date ?? currentDate());
  const [link, setLink] = useState(initial?.link ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      companyId: Number(companyId),
      status,
      date,
      link: link.trim() ? link.trim() : null,
      description: description.trim() ? description.trim() : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Nome da vaga" htmlFor="name">
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Vaga Backend Node - Acme"
          className={inputClass}
        />
      </Field>

      <Field label="Empresa" htmlFor="companyId">
        <select
          id="companyId"
          required
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Selecione uma empresa
          </option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Status" htmlFor="status">
          <select
            id="status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplyStatus)}
            className={inputClass}
          >
            {STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data" htmlFor="date">
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

      <Field label="Link (opcional)" htmlFor="link">
        <input
          id="link"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </Field>

      <Field label="Descrição (opcional)" htmlFor="description">
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : initial ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
