/**
 * Utilidades de fuso horário usando só a API `Intl` (sem libs/API externa).
 * O cálculo de offset é feito formatando um instante no fuso e comparando com
 * o UTC — técnica padrão que respeita horário de verão (DST).
 */

/** Offset do fuso (em ms) num dado instante: quanto o fuso está à frente do UTC. */
function zoneOffsetMs(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);

  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = Number(p.value);
  }
  // `hour` pode vir como 24 à meia-noite em alguns ambientes.
  const hour = map.hour === 24 ? 0 : map.hour;
  const asUtc = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    hour,
    map.minute,
    map.second,
  );
  return asUtc - date.getTime();
}

/**
 * Converte uma hora "de parede" (ex.: 14:00 em Nova York) no fuso de origem
 * para o instante UTC correspondente (Date).
 */
export function wallTimeToInstant(
  isoLocal: string,
  timeZone: string,
): Date | null {
  // isoLocal vem do <input type="datetime-local">: "YYYY-MM-DDTHH:mm".
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(isoLocal);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  // 1ª aproximação: trata os componentes como se fossem UTC.
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  // Ajusta pelo offset real do fuso naquele instante.
  const offset = zoneOffsetMs(timeZone, new Date(guess));
  return new Date(guess - offset);
}

/** Formata um instante (Date) num fuso, em pt-BR. */
export function formatInZone(
  date: Date,
  timeZone: string,
  opts: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  },
): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone, ...opts }).format(date);
}

/** Fuso local do navegador (ex.: "America/Sao_Paulo"). */
export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** Fusos úteis para vagas remotas US/CA/EU + Brasil. */
export const COMMON_ZONES: { id: string; label: string }[] = [
  { id: 'America/Sao_Paulo', label: 'São Paulo' },
  { id: 'America/New_York', label: 'Nova York (ET)' },
  { id: 'America/Chicago', label: 'Chicago (CT)' },
  { id: 'America/Denver', label: 'Denver (MT)' },
  { id: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { id: 'America/Toronto', label: 'Toronto' },
  { id: 'America/Vancouver', label: 'Vancouver' },
  { id: 'Europe/Lisbon', label: 'Lisboa' },
  { id: 'Europe/London', label: 'Londres' },
];
