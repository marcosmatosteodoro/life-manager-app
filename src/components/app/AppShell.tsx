'use client';

import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/Toaster';
import { useProfileStore } from '@/hooks/useProfileStore';
import { getToken } from '@/services/authToken';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const CHANGE_PASSWORD_PATH = '/trocar-senha';

/**
 * Estrutura visual + portão de autenticação. A rota /login não usa o shell;
 * as demais exigem token (senão redireciona para /login). Após autenticar,
 * carrega o perfil e, se `mustChangePassword`, força a troca de senha.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/login';
  const [authChecked, setAuthChecked] = useState(false);
  const loadProfile = useProfileStore((s) => s.load);
  const mustChangePassword = useProfileStore(
    (s) => s.profile?.mustChangePassword ?? false,
  );

  useEffect(() => {
    if (isLogin) return;
    if (getToken()) {
      setAuthChecked(true);
    } else {
      router.replace('/login');
    }
  }, [isLogin, pathname, router]);

  // Carrega o perfil uma vez após autenticar (tema, altura, flag de senha).
  useEffect(() => {
    if (authChecked && !isLogin) void loadProfile();
  }, [authChecked, isLogin, loadProfile]);

  // Gate: enquanto a senha precisar ser trocada, prende o usuário nessa tela.
  useEffect(() => {
    if (
      authChecked &&
      mustChangePassword &&
      pathname !== CHANGE_PASSWORD_PATH
    ) {
      router.replace(CHANGE_PASSWORD_PATH);
    }
  }, [authChecked, mustChangePassword, pathname, router]);

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
