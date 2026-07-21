import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app/AppShell";
import { ServiceWorkerRegister } from "@/components/app/ServiceWorkerRegister";
import { I18nProvider } from "@/i18n/I18nProvider";
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

// Aplica tema e idioma salvos ANTES do primeiro paint (evita flash e mismatch
// de hidratação). Lê os mesmos localStorage dos stores (persist serializa
// { state: {...} }). Chaves de cor e nomes de var são fixos aqui; os valores
// vêm do localStorage do próprio usuário e entram via setProperty (sem injeção).
const CUSTOM_COLOR_KEYS = [
  'background', 'foreground', 'surface', 'surface-muted', 'surface-subtle',
  'surface-inverse', 'fg', 'fg-soft', 'fg-muted', 'fg-subtle', 'edge',
  'edge-strong', 'edge-inverse',
];
const initScript = `(function(){try{var t=localStorage.getItem("lm_theme");if(t){var s=JSON.parse(t).state;if(s.theme==="dark"){document.documentElement.classList.add("dark")}else if(s.theme==="custom"&&s.customColors){var k=${JSON.stringify(
  CUSTOM_COLOR_KEYS,
)};for(var i=0;i<k.length;i++){var v=s.customColors[k[i]];if(v){document.documentElement.style.setProperty("--"+k[i],v)}}}}}catch(e){}try{var l=localStorage.getItem("lm_locale");if(l){document.documentElement.lang=JSON.parse(l).state.locale==="en"?"en-US":"pt-BR"}}catch(e){}})();`;

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
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <I18nProvider>
          <AppShell>{children}</AppShell>
        </I18nProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
