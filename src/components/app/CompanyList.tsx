'use client';

import { Button } from '@/components/ui/Button';
import type { Company } from '@/services/company.types';

interface CompanyListProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompanyList({ companies, onEdit, onDelete }: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
        Nenhuma empresa cadastrada ainda.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {companies.map((company) => (
        <li
          key={company.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-900">
              {company.name}
            </p>
            <p className="mt-0.5 truncate text-sm text-neutral-500">
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {company.website}
              </a>
              {company.country ? ` · ${company.country.name}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" onClick={() => onEdit(company)}>
              Editar
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(company)}
            >
              Excluir
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
