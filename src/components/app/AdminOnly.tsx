'use client';

import { type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '@/components/ui/Loading';
import { useProfileStore } from '@/hooks/useProfileStore';

/**
 * Libera o conteúdo só para admin (defense-in-depth: o back já bloqueia com 403).
 * Enquanto o perfil não carrega, mostra Loading; member vê aviso de permissão.
 */
export function AdminOnly({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common');
  const profile = useProfileStore((s) => s.profile);
  const loading = useProfileStore((s) => s.loading);
  const load = useProfileStore((s) => s.load);

  useEffect(() => {
    if (!profile && !loading) void load();
  }, [profile, loading, load]);

  if (!profile) return <Loading />;
  if (profile.role !== 'admin') {
    return (
      <section className="mx-auto w-full max-w-xl">
        <p className="rounded-lg border border-dashed border-edge-strong px-4 py-16 text-center text-sm text-fg-muted">
          {t('adminOnly')}
        </p>
      </section>
    );
  }
  return <>{children}</>;
}
