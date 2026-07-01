'use client';

import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/hooks/useProfileStore';
import { ChangePasswordForm } from './ChangePasswordForm';

/**
 * Tela de troca obrigatória no 1º login (admin semeado). Ao concluir, recarrega
 * o perfil (zera `mustChangePassword`) e libera o app.
 */
export function ForcedPasswordChange() {
  const router = useRouter();
  const loadProfile = useProfileStore((s) => s.load);

  async function handleSuccess() {
    await loadProfile();
    router.replace('/');
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-fg">
          Troque sua senha
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Por segurança, defina uma nova senha antes de continuar.
        </p>
      </div>
      <ChangePasswordForm onSuccess={() => void handleSuccess()} />
    </section>
  );
}
