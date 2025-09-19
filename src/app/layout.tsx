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
        <meta name="color-scheme" content="dark light" />
        
        {/* BLOCKING script - executes BEFORE any rendering */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  // Get theme immediately
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = stored || (prefersDark ? 'dark' : 'light');
                  
                  var root = document.documentElement;
                  
                  // Apply theme class and CSS variables IMMEDIATELY
                  if (theme === 'dark') {
                    root.classList.add('dark');
                    root.setAttribute('data-theme', 'dark');
                    // Set ALL CSS variables for dark mode
                    root.style.setProperty('--bg', '#0b0f14');
                    root.style.setProperty('--text', '#E6EEF6');
                    root.style.setProperty('--muted', '#9FB2C7');
                    root.style.setProperty('--card', '#10161d');
                    root.style.setProperty('--border', '#1d2731');
                    root.style.setProperty('--pill', '#0f141a');
                    root.style.setProperty('--pillHover', '#16202a');
                  } else {
                    root.classList.remove('dark');
                    root.setAttribute('data-theme', 'light');
                    // Set ALL CSS variables for light mode
                    root.style.setProperty('--bg', '#F7F9FA');
                    root.style.setProperty('--text', '#1a1a1a');
                    root.style.setProperty('--muted', '#536471');
                    root.style.setProperty('--card', '#ffffff');
                    root.style.setProperty('--border', '#E1E8ED');
                    root.style.setProperty('--pill', '#F7F9FA');
                    root.style.setProperty('--pillHover', '#E1E8ED');
                  }
                  root.setAttribute('data-theme-ready','true');
                  root.style.colorScheme = theme;
                } catch (e) {
                  // Fallback to light mode if anything fails
                  document.documentElement.style.setProperty('--bg', '#F7F9FA');
                }
              })();
            `,
          }}
        />
        
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
