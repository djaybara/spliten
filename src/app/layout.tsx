// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "spliten - Vote on Everything",
  description: "Share your opinions and vote on questions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme-ready="false" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />

        {/* BLOCKING script - executes BEFORE any rendering */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var root = document.documentElement;
                try {
                  var stored = null;
                  try { stored = localStorage.getItem('theme'); } catch (_) {}
                  var prefersDark = false;
                  try { prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (_) {}
                  var theme = stored === 'dark' || stored === 'light' ? stored : (prefersDark ? 'dark' : 'light');

                  var vars = theme === 'dark'
                    ? [['--bg', '#0b0f14'], ['--text', '#E6EEF6'], ['--muted', '#9FB2C7'], ['--card', '#10161d'], ['--border', '#1d2731'], ['--pill', '#0f141a'], ['--pillHover', '#16202a']]
                    : [['--bg', '#F7F9FA'], ['--text', '#1a1a1a'], ['--muted', '#536471'], ['--card', '#ffffff'], ['--border', '#E1E8ED'], ['--pill', '#F7F9FA'], ['--pillHover', '#E1E8ED']];

                  for (var i = 0; i < vars.length; i += 1) {
                    root.style.setProperty(vars[i][0], vars[i][1]);
                  }

                  root.classList.toggle('dark', theme === 'dark');
                  root.setAttribute('data-theme', theme);
                  root.style.backgroundColor = theme === 'dark' ? '#0b0f14' : '#F7F9FA';
                  root.style.color = theme === 'dark' ? '#E6EEF6' : '#1a1a1a';
                  root.style.colorScheme = theme;
                  try { localStorage.setItem('theme', theme); } catch (_) {}
                } catch (_) {
                  var fallbackVars = [['--bg', '#F7F9FA'], ['--text', '#1a1a1a'], ['--muted', '#536471'], ['--card', '#ffffff'], ['--border', '#E1E8ED'], ['--pill', '#F7F9FA'], ['--pillHover', '#E1E8ED']];
                  for (var j = 0; j < fallbackVars.length; j += 1) {
                    root.style.setProperty(fallbackVars[j][0], fallbackVars[j][1]);
                  }
                  root.classList.remove('dark');
                  root.setAttribute('data-theme', 'light');
                  root.style.backgroundColor = '#F7F9FA';
                  root.style.color = '#1a1a1a';
                  root.style.colorScheme = 'light';
                } finally {
                  root.setAttribute('data-theme-ready', 'true');
                }
              })();
            `,
          }}
        />

        {/* Hide content until the theme is applied */}
        <style id="theme-preflight">
          {`
            html[data-theme-ready="false"] body {
              visibility: hidden;
            }
          `}
        </style>
        <noscript>
          <style>{`html[data-theme-ready="false"] body { visibility: visible; }`}</style>
        </noscript>

        {/* Prevent transitions during initial load */}
        <style id="disable-transitions">
          {`
            *, *::before, *::after {
              transition: none !important;
              animation-duration: 0s !important;
              animation-delay: 0s !important;
            }
          `}
        </style>
      </head>
      
      <body suppressHydrationWarning>
        {children}
        
        {/* Re-enable transitions after hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                  var style = document.getElementById('disable-transitions');
                  if (style && style.parentNode) {
                    style.parentNode.removeChild(style);
                  }
                }, 100);
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
