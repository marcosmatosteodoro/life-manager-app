const pad = (n: number) => String(n).padStart(2, '0');

/** Data local de uma Date no formato YYYY-MM-DD. */
function localDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Verifica se um timestamp ISO ocorreu no dia de hoje (fuso local). */
export function isToday(iso: string): boolean {
  return localDate(new Date(iso)) === localDate(new Date());
}

/** Formata um timestamp ISO como DD/MM/AAAA HH:MM (pt-BR). */
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}
