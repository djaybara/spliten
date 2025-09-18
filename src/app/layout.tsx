// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "spliten - Vote on Everything",
  description: "Share your opinions and vote on questions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Boot thème AVANT hydratation */}
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
      </head>
      <body suppressHydrationWarning>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
