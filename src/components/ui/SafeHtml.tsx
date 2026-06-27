'use client';

import DOMPurify from 'isomorphic-dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

// Tags permitidas — cobrem o corretor de resumo e o feedback (que usa títulos).
// Qualquer outra (ex.: <script>, <img>, eventos) é removida na sanitização.
const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h3', 'h4'];

/**
 * Renderiza HTML confiável apenas após sanitizar (defesa contra XSS).
 * Usado para exibir o resumo corrigido, que pode vir com formatação simples.
 */
export function SafeHtml({ html, className }: SafeHtmlProps) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [], // sem atributos: nada de on*, style, href, etc.
  });
  return (
    <div
      className={className}
      // Conteúdo sanitizado logo acima.
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
