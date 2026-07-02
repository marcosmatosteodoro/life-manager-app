'use client';

import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import type { Country, CountryInput } from '@/services/country.types';

interface CountryFormProps {
  initial?: Country | null;
  submitting: boolean;
  onSubmit: (input: CountryInput) => void;
  onCancel: () => void;
}

export function CountryForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: CountryFormProps) {
  const { t } = useTranslation(['jobs', 'common']);
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? '');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ name: name.trim(), code: code.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t('countryForm.name')} htmlFor="name">
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('countryForm.namePlaceholder')}
          className={inputClass}
        />
      </Field>
      <Field label={t('countryForm.code')} htmlFor="code">
        <input
          id="code"
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t('countryForm.codePlaceholder')}
          className={inputClass}
        />
      </Field>
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          {t('common:cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? t('countryForm.saving')
            : initial
              ? t('countryForm.save')
              : t('countryForm.create')}
        </Button>
      </div>
    </form>
  );
}
