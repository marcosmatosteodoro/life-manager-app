'use client';

import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    authService.logout();
    router.replace('/login');
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-subtle hover:text-fg"
    >
      Sair
    </button>
  );
}
