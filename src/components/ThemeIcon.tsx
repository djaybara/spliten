'use client';

import { Moon, Sun } from 'lucide-react';

/**
 * Affiche les DEUX icônes (sun & moon) dans le DOM.
 * Le CSS décide laquelle est visible selon html[data-theme].
 * => Pas de branchement conditionnel = pas de mismatch SSR/CSR.
 */
export default function ThemeIcon({ size = 18 }: { size?: number }) {
  return (
    <span
      className="theme-icon inline-flex items-center justify-center"
      aria-hidden="true"
      suppressHydrationWarning
      style={{ width: size, height: size }}
    >
      {/* Les deux icônes existent toujours, on masque via CSS */}
      <span data-sun className="inline-flex">
        <Sun width={size} height={size} />
      </span>
      <span data-moon className="inline-flex">
        <Moon width={size} height={size} />
      </span>
    </span>
  );
}
