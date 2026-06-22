'use client';

import { useEffect } from 'react';

/** Registra o service worker do PWA (apenas em produção). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Falha no registro não deve quebrar a aplicação.
    });
  }, []);

  return null;
}
