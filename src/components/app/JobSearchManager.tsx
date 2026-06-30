'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import type { ApplyInput } from '@/services/apply.types';
import { applyService } from '@/services/applyService';
import { companyService } from '@/services/companyService';
import type { Company } from '@/services/company.types';
import { countryService } from '@/services/countryService';
import type { Country } from '@/services/country.types';
import { ApiError } from '@/services/http';
import {
  JOB_PERIOD_OPTIONS,
  JOB_PROVIDER_OPTIONS,
  type JobProvider,
  type JobRow,
  type JobSearchPeriod,
} from '@/services/jobSearch.types';
import { jobSearchService } from '@/services/jobSearchService';
import { formatDateTime } from '@/utils/date';
import { ApplyForm } from './ApplyForm';

type LoadState = 'loading' | 'loaded' | 'error';
type SearchState = 'idle' | 'searching' | 'done' | 'error';

const inputClass =
  'rounded-md border border-edge-strong px-3 py-2 text-sm text-fg outline-none transition-colors focus:border-edge-inverse';

export function JobSearchManager() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  // Filtros.
  const [providers, setProviders] = useState<JobProvider[]>([
    'adzuna',
    'jsearch',
  ]);
  const [period, setPeriod] = useState<JobSearchPeriod>('3d');
  const [countryId, setCountryId] = useState('');

  // Busca.
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchError, setSearchError] = useState<string[]>([]);
  const [rows, setRows] = useState<JobRow[]>([]);

  // Salvar como candidatura.
  const [savingJob, setSavingJob] = useState<JobRow | null>(null);
  const [submittingApply, setSubmittingApply] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const [countryRes, companyRes] = await Promise.all([
        countryService.list(),
        companyService.list(),
      ]);
      setCountries(countryRes.rows);
      setCompanies(companyRes.rows);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error));
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function toggleProvider(value: JobProvider) {
    setProviders((current) =>
      current.includes(value)
        ? current.filter((p) => p !== value)
        : [...current, value],
    );
  }

  async function handleSearch() {
    if (providers.length === 0) {
      toast.error('Selecione ao menos um provedor.');
      return;
    }
    setSearchState('searching');
    try {
      const { rows: found } = await jobSearchService.search({
        providers,
        period,
        countryId: countryId ? Number(countryId) : undefined,
      });
      setRows(found);
      setSearchState('done');
    } catch (error) {
      setSearchError(toMessages(error));
      setSearchState('error');
    }
  }

  async function handleSaveApply(input: ApplyInput) {
    setSubmittingApply(true);
    try {
      await applyService.create(input);
      toast.success('Candidatura salva com sucesso.');
      setSavingJob(null);
    } catch (error) {
      toast.errors(toMessages(error));
    } finally {
      setSubmittingApply(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">
        Buscar vagas
      </h1>
      <p className="mt-1 text-sm text-fg-muted">
        Vagas remotas ranqueadas pela sua stack. Salve as que aplicar como
        candidatura.
      </p>

      {loadState === 'error' && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="whitespace-pre-line">{loadError.join('\n')}</p>
          <Button variant="secondary" className="mt-3" onClick={() => void load()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {loadState === 'loaded' && (
        <>
          {/* Filtros */}
          <div className="mt-6 flex flex-col gap-4 rounded-lg border border-edge bg-surface p-4">
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-fg-soft">
                  Período
                </span>
                <select
                  value={period}
                  onChange={(e) =>
                    setPeriod(e.target.value as JobSearchPeriod)
                  }
                  className={inputClass}
                >
                  {JOB_PERIOD_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-fg-soft">
                  País
                </span>
                <select
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Padrão (Brasil)</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-fg-soft">
                  Provedores
                </span>
                <div className="flex items-center gap-3 py-2">
                  {JOB_PROVIDER_OPTIONS.map((o) => (
                    <label
                      key={o.value}
                      className="flex items-center gap-1.5 text-sm text-fg-soft"
                    >
                      <input
                        type="checkbox"
                        checked={providers.includes(o.value)}
                        onChange={() => toggleProvider(o.value)}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Button
                onClick={() => void handleSearch()}
                disabled={searchState === 'searching'}
              >
                {searchState === 'searching' ? 'Buscando…' : 'Buscar'}
              </Button>
            </div>
            <p className="text-xs text-fg-subtle">
              Apenas vagas remotas. Sinais de contratação internacional sobem no
              ranking (heurística).
            </p>
          </div>

          {/* Resultados */}
          <div className="mt-6">
            {searchState === 'error' && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="whitespace-pre-line">{searchError.join('\n')}</p>
              </div>
            )}

            {searchState === 'done' && rows.length === 0 && (
              <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
                Nenhuma vaga encontrada com esses filtros.
              </p>
            )}

            {searchState === 'done' && rows.length > 0 && (
              <>
                <p className="mb-2 text-sm text-fg-muted">
                  {rows.length} vaga{rows.length === 1 ? '' : 's'} encontrada
                  {rows.length === 1 ? '' : 's'}.
                </p>
                <ul className="flex flex-col gap-3">
                  {rows.map((job, index) => (
                    <JobCard
                      key={`${job.source}-${index}-${job.url}`}
                      job={job}
                      onSave={() => setSavingJob(job)}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      )}

      {/* Modal: salvar como candidatura */}
      <Modal
        open={savingJob !== null}
        title="Salvar como candidatura"
        onClose={() => {
          if (!submittingApply) setSavingJob(null);
        }}
      >
        {companies.length === 0 ? (
          <p className="text-sm text-fg-muted">
            Você precisa cadastrar uma empresa antes de salvar.{' '}
            <Link href="/vagas/empresas" className="font-medium underline">
              Criar empresa
            </Link>
            .
          </p>
        ) : (
          savingJob && (
            <ApplyForm
              prefill={{
                name: savingJob.title,
                link: savingJob.url || null,
                description: savingJob.description,
                status: 'APPLIED',
              }}
              companies={companies}
              submitting={submittingApply}
              onSubmit={(input) => void handleSaveApply(input)}
              onCancel={() => {
                if (!submittingApply) setSavingJob(null);
              }}
            />
          )
        )}
      </Modal>
    </section>
  );
}

function JobCard({ job, onSave }: { job: JobRow; onSave: () => void }) {
  const salary =
    job.salaryMin || job.salaryMax
      ? `${fmtSalary(job.salaryMin)}–${fmtSalary(job.salaryMax)}`
      : null;

  return (
    <li className="rounded-lg border border-edge bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-fg hover:underline"
          >
            {job.title}
          </a>
          <p className="mt-0.5 text-sm text-fg-muted">
            {[job.company, job.location].filter(Boolean).join(' · ') || '—'}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-medium uppercase text-fg-muted">
            {job.source}
          </span>
          <span className="text-xs text-fg-subtle">score {job.score}</span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {job.hiresInternational && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Possível contratação internacional
          </span>
        )}
        {job.matchedKeywords.map((kw) => (
          <span
            key={kw}
            className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700"
          >
            {kw}
          </span>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-fg-subtle">
        <span className="uppercase">{job.countryCode}</span>
        {salary && <span>{salary}</span>}
        {job.postedAt && <span>{formatDateTime(job.postedAt)}</span>}
      </div>

      <div className="mt-3 flex gap-2">
        <a href={job.url} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary">Abrir vaga</Button>
        </a>
        <Button variant="ghost" onClick={onSave}>
          Salvar
        </Button>
      </div>
    </li>
  );
}

function fmtSalary(value: number | null): string {
  if (value == null) return '?';
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);
}

function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
