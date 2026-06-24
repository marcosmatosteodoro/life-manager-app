const pad = (n: number) => String(n).padStart(2, '0');

/** Data local de uma Date no formato YYYY-MM-DD. */
function localDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Verifica se um timestamp ISO ocorreu no dia de hoje (fuso local). */
export function isToday(iso: string): boolean {
  return localDate(new Date(iso)) === localDate(new Date());
}

/** Data de hoje (fuso local) no formato YYYY-MM-DD. */
export function todayDate(): string {
  return localDate(new Date());
}

/** Formata uma data YYYY-MM-DD como DD/MM/AAAA, sem deslocar fuso. */
const dateOnlyFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

export function formatDate(isoDate: string): string {
  return dateOnlyFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

/** Formata um timestamp ISO como DD/MM/AAAA HH:MM (pt-BR). */
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}
