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
      className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
    >
      Sair
    </button>
  );
}
