'use client';

import { type SVGProps, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Company } from '@/services/company.types';
import { cn } from '@/utils/cn';

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
        <CompanyRow
          key={company.id}
          company={company}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

function CompanyRow({
  company,
  onEdit,
  onDelete,
}: {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-start gap-2">
          {/* Setinha: abre/fecha as observações (mesma seta, gira ao abrir) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Ocultar observações' : 'Ver observações'}
            className="mt-0.5 rounded-md p-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <ChevronDownIcon
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                open && 'rotate-180',
              )}
            />
          </button>

          {/* Título / país / link */}
          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-900">
              {company.name}
            </p>
            <p className="mt-0.5 truncate text-sm text-neutral-500">
              {company.country ? company.country.name : '—'}
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
            </p>
          </div>
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
      </div>

      {/* Collapse animado das observações (grid-rows 0fr→1fr) */}
      <div
        className={cn(
          'grid px-4 transition-[grid-template-rows] duration-300 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <p className="border-t border-neutral-100 py-3 text-sm whitespace-pre-line text-neutral-600">
            {company.observation?.trim() ? (
              company.observation
            ) : (
              <span className="text-neutral-400">Sem observações.</span>
            )}
          </p>
        </div>
      </div>
    </li>
  );
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
