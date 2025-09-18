'use client';

import { useEffect, useState } from 'react';

/**
 * ThemeProvider
 * - Lit le thème sauvegardé (localStorage.theme) sinon préfère le thème système.
 * - Applique la classe "dark" sur <html> et data-theme="dark|light">
 * - N'affiche les enfants qu'une fois le thème appliqué pour éviter le flash.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const root = document.documentElement;
      let t = localStorage.getItem('theme') as 'dark' | 'light' | null;

      if (!t) {
        t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      if (t === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }

      localStorage.setItem('theme', t);
    } catch (_) {
      /* ignore */
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) return null; // évite le flash
  return <>{children}</>;
}