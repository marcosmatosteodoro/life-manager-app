/**
 * Junta classes condicionais ignorando valores falsy.
 * Mantém a composição de classes Tailwind legível sem dependência externa.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ');
}
