'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useProfileStore } from '@/hooks/useProfileStore';
import { ChangePasswordForm } from './ChangePasswordForm';

/**
 * Tela de troca obrigatória no 1º login (admin semeado). Ao concluir, recarrega
 * o perfil (zera `mustChangePassword`) e libera o app.
 */
export function ForcedPasswordChange() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const loadProfile = useProfileStore((s) => s.load);

  async function handleSuccess() {
    await loadProfile();
    router.replace('/');
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-fg">
          {t('forcedTitle')}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          {t('forcedSubtitle')}
        </p>
      </div>
      <ChangePasswordForm onSuccess={() => void handleSuccess()} />
    </section>
  );
}
