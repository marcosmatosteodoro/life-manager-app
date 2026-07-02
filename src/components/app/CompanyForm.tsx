'use client';

import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import type { Company, CompanyInput } from '@/services/company.types';
import type { Country } from '@/services/country.types';

interface CompanyFormProps {
  initial?: Company | null;
  countries: Country[];
  submitting: boolean;
  onSubmit: (input: CompanyInput) => void;
  onCancel: () => void;
}

export function CompanyForm({
  initial,
  countries,
  submitting,
  onSubmit,
  onCancel,
}: CompanyFormProps) {
  const { t } = useTranslation(['jobs', 'common']);
  const [name, setName] = useState(initial?.name ?? '');
  const [website, setWebsite] = useState(initial?.website ?? '');
  const [countryId, setCountryId] = useState(
    initial ? String(initial.countryId) : '',
  );
  const [observation, setObservation] = useState(initial?.observation ?? '');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      website: website.trim(),
      countryId: Number(countryId),
      observation: observation.trim() ? observation.trim() : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t('companyForm.name')} htmlFor="name">
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('companyForm.namePlaceholder')}
          className={inputClass}
        />
      </Field>
      <Field label={t('companyForm.country')} htmlFor="countryId">
        <select
          id="countryId"
          required
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            {t('companyForm.countryDefault')}
          </option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name} ({country.code})
            </option>
          ))}
        </select>
      </Field>
      <Field label={t('companyForm.website')} htmlFor="website">
        <input
          id="website"
          type="url"
          required
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://acme.com"
          className={inputClass}
        />
      </Field>
      <Field label={t('companyForm.observation')} htmlFor="observation">
        <textarea
          id="observation"
          rows={3}
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          placeholder={t('companyForm.observationPlaceholder')}
          className={`${inputClass} resize-y`}
        />
      </Field>
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          {t('common:cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? t('companyForm.saving')
            : initial
              ? t('companyForm.save')
              : t('companyForm.create')}
        </Button>
      </div>
    </form>
  );
}
