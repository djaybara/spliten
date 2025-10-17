// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext'; // ← NOUVELLE LIGNE

export const metadata: Metadata = {
  title: "spliten - Vote on Everything",
  description: "Share your opinions and vote on questions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Indique au navigateur que les deux thèmes existent (meilleure peinture initiale) */}
        <meta name="color-scheme" content="light dark" />

        {/* Boot thème AVANT hydratation – garde la classe dès le 1er paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var root = document.documentElement;
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') root.classList.add('dark');
    root.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`,
          }}
        />
        {/* Quand tout est prêt, on active les transitions (cf. globals.css gate sur [data-theme-ready]) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var setReady=function(){
    try { document.documentElement.setAttribute('data-theme-ready','true'); } catch(e){}
  };
  if (document.readyState === 'complete') setReady();
  else window.addEventListener('load', setReady, { once: true });
})();
`,
          }}
        />
      </head>

      {/* Fond inline immédiatement (avant CSS), empêche tout flash noir */}
      <body suppressHydrationWarning style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
        {/* ← WRAP children dans LanguageProvider */}
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}