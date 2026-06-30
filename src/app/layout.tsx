import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app/AppShell";
import { ServiceWorkerRegister } from "@/components/app/ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Life Manager",
  description: "Gerenciador pessoal — começando pelo controle de peso",
  // Habilita comportamento de app instalado no iOS.
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Life Manager",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Aplica o tema salvo ANTES do primeiro paint (evita flash claro→escuro).
// Lê o mesmo localStorage do useThemeStore (persist serializa { state: {...} }).
// Conteúdo estático, sem input do usuário — sem risco de injeção.
const themeInitScript = `(function(){try{var v=localStorage.getItem("lm_theme");if(v&&JSON.parse(v).state.theme==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning: extensões de navegador (ex.: tradutores)
          injetam atributos/elementos antes da hidratação; e a classe .dark é
          adicionada pelo script abaixo antes da hidratação do React. */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
