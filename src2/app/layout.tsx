// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "spliten - Vote on Everything",
  description: "Share your opinions and vote on questions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Aide le navigateur à choisir les bons styles natifs */}
        <meta name="color-scheme" content="light dark" />
        {/* Boot thème AVANT hydratation (no-flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var root = document.documentElement;
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    root.setAttribute('data-theme', theme);
    // pour formulaires/scrollbars natifs
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}