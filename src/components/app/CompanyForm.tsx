'use client';

import { type FormEvent, useState } from 'react';
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
  const [name, setName] = useState(initial?.name ?? '');
  const [website, setWebsite] = useState(initial?.website ?? '');
  const [countryId, setCountryId] = useState(
    initial ? String(initial.countryId) : '',
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      website: website.trim(),
      countryId: Number(countryId),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Nome" htmlFor="name">
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Acme Corp"
          className={inputClass}
        />
      </Field>
      <Field label="Website" htmlFor="website">
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
      <Field label="País" htmlFor="countryId">
        <select
          id="countryId"
          required
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Selecione um país
          </option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name} ({country.code})
            </option>
          ))}
        </select>
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
