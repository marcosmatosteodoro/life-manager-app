'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { authService } from '@/services/authService';

/**
 * Ações do Header em telas pequenas: menu hambúrguer com Meu perfil, alternar
 * tema e Sair. No desktop essas ações ficam inline (ThemeToggle + LogoutButton).
 */
export function HeaderMenu() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { theme, toggle } = useThemeToggle();

  function handleLogout() {
    authService.logout();
    router.replace('/login');
  }

  return (
    <DropdownMenu
      ariaLabel={t('menu')}
      icon={<HamburgerIcon className="h-5 w-5" />}
      items={[
        {
          label: theme === 'dark' ? t('themeLight') : t('themeDark'),
          onClick: () => void toggle(),
        },
        { label: t('logout'), onClick: handleLogout, danger: true },
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
