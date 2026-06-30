'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  COMMON_ZONES,
  formatInZone,
  localTimeZone,
  wallTimeToInstant,
} from '@/utils/timezone';

const inputClass =
  'w-full rounded-md border border-edge-strong px-3 py-2 text-sm text-fg outline-none transition-colors focus:border-edge-inverse';

export function TimezoneConverter() {
  const local = useMemo(() => localTimeZone(), []);
  const [now, setNow] = useState<Date | null>(null);

  // Relógio ao vivo (atualiza a cada 30s). `now` só existe no cliente.
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Conversor de horário específico.
  const [when, setWhen] = useState('');
  const [origin, setOrigin] = useState(local);
  const [target, setTarget] = useState('America/New_York');

  const instant = when ? wallTimeToInstant(when, origin) : null;

  return (
    <div className="rounded-lg border border-edge bg-surface p-4">
      <h2 className="text-sm font-semibold text-fg">
        🕐 Conversor de fuso horário
      </h2>
      <p className="mt-0.5 text-xs text-fg-muted">
        Seu fuso: <span className="font-medium">{local}</span>
      </p>

      {/* Agora nos principais fusos */}
      <div className="mt-4">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
          Agora
        </span>
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COMMON_ZONES.map((z) => (
            <li
              key={z.id}
              className="rounded-md bg-surface-muted px-3 py-2 text-center"
            >
              <span className="block text-xs text-fg-muted">{z.label}</span>
              <span className="block text-base font-semibold text-fg tabular-nums">
                {now
                  ? formatInZone(now, z.id, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Converter um horário específico */}
      <div className="mt-5 border-t border-edge pt-4">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
          Converter um horário
        </span>
        <div className="mt-2 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg-soft">
              Data e hora
            </span>
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className={inputClass}
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium text-fg-soft">De</span>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className={inputClass}
              >
                {zoneOptions(local)}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium text-fg-soft">Para</span>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className={inputClass}
              >
                {zoneOptions(local)}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-3 rounded-md bg-surface-muted px-3 py-3 text-center">
          <span className="text-xs text-fg-subtle">No fuso de destino</span>
          <p className="text-lg font-semibold text-fg">
            {instant
              ? formatInZone(instant, target, {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Opções do select, incluindo o fuso local caso não esteja na lista comum. */
function zoneOptions(local: string) {
  const zones = COMMON_ZONES.some((z) => z.id === local)
    ? COMMON_ZONES
    : [{ id: local, label: `${local} (seu fuso)` }, ...COMMON_ZONES];
  return zones.map((z) => (
    <option key={z.id} value={z.id}>
      {z.label}
    </option>
  ));
}
