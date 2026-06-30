'use client';

import { useRouter } from 'next/navigation';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { useThemeStore } from '@/hooks/useThemeStore';
import { authService } from '@/services/authService';

/**
 * Ações do Header em telas pequenas: menu hambúrguer com alternar tema + Sair.
 * No desktop essas ações ficam inline (ThemeToggle + LogoutButton).
 */
export function HeaderMenu() {
  const router = useRouter();
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  function handleLogout() {
    authService.logout();
    router.replace('/login');
  }

  return (
    <DropdownMenu
      ariaLabel="Menu"
      icon={<HamburgerIcon className="h-5 w-5" />}
      items={[
        {
          label: theme === 'dark' ? 'Tema claro' : 'Tema escuro',
          onClick: toggle,
        },
        { label: 'Sair', onClick: handleLogout, danger: true },
      ]}
    />
  );
}

function HamburgerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
