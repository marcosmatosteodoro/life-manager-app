'use client';

import DOMPurify from 'isomorphic-dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

// Tags permitidas — espelham o que o corretor de resumo é instruído a gerar.
// Qualquer outra (ex.: <script>, <img>, eventos) é removida na sanitização.
const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'li'];

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
