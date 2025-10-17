// src/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark";

declare global {
  interface Window {
    __setTheme?: (t: Mode) => void;
  }
}

function computeVars(theme: Mode) {
  return theme === "dark"
    ? ":root{--bg:#0b0f14;--text:#E6EEF6;--muted:#9FB2C7;--card:#10161d;--border:#1d2731;--pill:#0f141a;--pillHover:#16202a;}"
    : ":root{--bg:#F7F9FA;--text:#1a1a1a;--muted:#536471;--card:#ffffff;--border:#E1E8ED;--pill:#F7F9FA;--pillHover:#E1E8ED;}";
}

function ensureStyleEl(): HTMLStyleElement {
  let el = document.getElementById("theme-vars") as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = "theme-vars";
    document.head.appendChild(el);
  }
  return el;
}

function applyThemeLocally(theme: Mode, persist = true) {
  const root = document.documentElement;

  // Variables critiques (anti-flash)
  ensureStyleEl().innerHTML = computeVars(theme);

  // Attributs
  root.setAttribute("data-theme", theme);
  (root.style as any).colorScheme = theme;

  // Tailwind 'dark:'
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");

  if (persist) {
    try { localStorage.setItem("theme", theme); } catch {}
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Mode>("light");

  useEffect(() => {
    // Lecture initiale fiable : data-theme > localStorage > prefers
    const root = document.documentElement;
    let initial = (root.getAttribute("data-theme") as Mode | null);
    if (!initial) {
      try {
        const s = localStorage.getItem("theme") as Mode | null;
        if (s === "light" || s === "dark") initial = s;
      } catch {}
    }
    if (!initial) {
      initial = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    applyThemeLocally(initial, false);
    setTheme(initial);

    // Sync inter-onglets
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme") {
        const v = e.newValue as Mode | null;
        if (v === "light" || v === "dark") {
          applyThemeLocally(v, false);
          setTheme(v);
        }
      }
    };
    window.addEventListener("storage", onStorage);

    // Sync intra-onglet via event global (depuis layout)
    const onThemeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as Mode | undefined;
      if (detail === "light" || detail === "dark") {
        applyThemeLocally(detail, false);
        setTheme(detail);
      }
    };
    window.addEventListener("themechange", onThemeChange);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("themechange", onThemeChange);
    };
  }, []);

  const toggle = () => {
    const next: Mode = theme === "dark" ? "light" : "dark";

    // Utilise l'API globale si dispo (définie dans layout.tsx)
    if (typeof window !== "undefined" && typeof window.__setTheme === "function") {
      window.__setTheme(next);
    } else {
      // Fallback sûr si le script n'est pas injecté
      applyThemeLocally(next, true);
    }

    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-[var(--border)] bg-[var(--pill)] hover:bg-[var(--pillHover)] transition"
    >
      <span className="text-sm">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}