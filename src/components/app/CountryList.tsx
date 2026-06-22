'use client';

import { Button } from '@/components/ui/Button';
import type { Country } from '@/services/country.types';

interface CountryListProps {
  countries: Country[];
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
}

export function CountryList({ countries, onEdit, onDelete }: CountryListProps) {
  if (countries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
        Nenhum país cadastrado ainda.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {countries.map((country) => (
        <li
          key={country.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="font-medium text-neutral-900">{country.name}</span>
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {country.code}
            </span>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" onClick={() => onEdit(country)}>
              Editar
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(country)}
            >
              Excluir
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
