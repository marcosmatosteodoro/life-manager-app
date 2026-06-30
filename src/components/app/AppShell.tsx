'use client';

import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/Toaster';
import { getToken } from '@/services/authToken';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

/**
 * Estrutura visual + portão de autenticação. A rota /login não usa o shell;
 * as demais exigem token (senão redireciona para /login).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/login';
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isLogin) return;
    if (getToken()) {
      setAuthChecked(true);
    } else {
      router.replace('/login');
    }
  }, [isLogin, pathname, router]);

  // Página de login: sem sidebar/header.
  if (isLogin) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  // Evita exibir conteúdo protegido antes de confirmar o token.
  if (!authChecked) return null;

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted text-fg">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 pb-24 md:pb-6">{children}</main>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}
