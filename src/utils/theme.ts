import type { CustomColors, Theme } from '@/services/user.types';

/**
 * Tokens de cor editáveis no tema custom. `key` = variável CSS (sem `--`),
 * espelhando `globals.css`; `labelKey` = chave i18n (namespace `profile`).
 */
export const COLOR_TOKENS: { key: keyof CustomColors; labelKey: string }[] = [
  { key: 'background', labelKey: 'colorBackground' },
  { key: 'foreground', labelKey: 'colorForeground' },
  { key: 'surface', labelKey: 'colorSurface' },
  { key: 'surface-muted', labelKey: 'colorSurfaceMuted' },
  { key: 'surface-subtle', labelKey: 'colorSurfaceSubtle' },
  { key: 'surface-inverse', labelKey: 'colorSurfaceInverse' },
  { key: 'fg', labelKey: 'colorFg' },
  { key: 'fg-soft', labelKey: 'colorFgSoft' },
  { key: 'fg-muted', labelKey: 'colorFgMuted' },
  { key: 'fg-subtle', labelKey: 'colorFgSubtle' },
  { key: 'edge', labelKey: 'colorEdge' },
  { key: 'edge-strong', labelKey: 'colorEdgeStrong' },
  { key: 'edge-inverse', labelKey: 'colorEdgeInverse' },
];

/**
 * Paleta padrão do editor custom = tema claro atual (hex do Tailwind neutral,
 * espelhando os valores de `globals.css`). Ponto de partida ao personalizar.
 */
export const DEFAULT_CUSTOM_COLORS: Required<CustomColors> = {
  background: '#ffffff',
  foreground: '#171717',
  surface: '#ffffff',
  'surface-muted': '#fafafa',
  'surface-subtle': '#f5f5f5',
  'surface-inverse': '#171717',
  fg: '#171717',
  'fg-soft': '#404040',
  'fg-muted': '#737373',
  'fg-subtle': '#a3a3a3',
  edge: '#e5e5e5',
  'edge-strong': '#d4d4d4',
  'edge-inverse': '#171717',
};

/** Aplica as cores custom como variáveis CSS inline no <html> (preview/persistido). */
export function applyCustomVars(colors: CustomColors): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const { key } of COLOR_TOKENS) {
    const value = colors[key];
    if (value) root.style.setProperty(`--${key}`, value);
  }
}

/** Remove as variáveis inline; volta a valer o `:root`/`.dark` do CSS. */
export function clearCustomVars(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const { key } of COLOR_TOKENS) {
    root.style.removeProperty(`--${key}`);
  }
}

/** Aplica o tema no <html>: classe `.dark` e/ou as variáveis do custom. */
export function applyTheme(
  theme: Theme,
  customColors?: CustomColors | null,
): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  if (theme === 'custom') {
    applyCustomVars(customColors ?? DEFAULT_CUSTOM_COLORS);
  } else {
    clearCustomVars();
  }
}
