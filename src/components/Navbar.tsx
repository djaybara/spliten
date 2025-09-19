'use client';

import { useRouter } from 'next/navigation'; // AJOUTER
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Moon, Sun, Bell, Globe, ChevronDown } from 'lucide-react';

type NavbarProps = {
  isMobile: boolean;
  isLoggedIn: boolean;
  username?: string;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onLoginClick: () => void;
  onSignupClick: () => void; // gardé pour compat, non affiché
  onAskClick?: () => void;
  notificationsCount?: number; // optionnel pour la cloche
};

/** retourne le thème initial SANS glitch d’icône */
function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export default function Navbar({
  isMobile,
  isLoggedIn,
  username = 'user',
  searchQuery,
  onSearchChange,
  onLoginClick,
  onSignupClick, // non rendu
  onAskClick,
  notificationsCount = 0,
}: NavbarProps) {
  /* ================= THEME ================= */
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-theme-ready', 'true'); // <- ajouté
    root.style.colorScheme = theme;                // <- ajouté
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  const router = useRouter(); // AJOUTER

  /* ================ LANG MENU ================ */
  const [lang, setLang] = useState<string>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('lang') || 'en' : 'en'
  );
  const [showLang, setShowLang] = useState(false);
  const langBtnRef = useRef<HTMLButtonElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  const onLang = (v: string) => {
    setLang(v);
    localStorage.setItem('lang', v);
    setShowLang(false);
  };

  // fermer le menu en cliquant en dehors
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (!langMenuRef.current || !langBtnRef.current) return;
      if (!langMenuRef.current.contains(t) && !langBtnRef.current.contains(t)) {
        setShowLang(false);
      }
    }
    if (showLang) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showLang]);

  /* ================ RENDER ================ */
  return (
    <header
      style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 20px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Logo Spliten */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 20,
            }}
          >
            S
          </div>
          {!isMobile && (
            <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>
              Spliten
            </span>
          )}
        </Link>

        {/* Barre de recherche */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 640 }}>
            <Search
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)',
                width: 18,
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isMobile ? 'Search...' : 'Search questions, topics, or categories'}
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                backgroundColor: 'var(--bg)',
                border: '1px solid transparent',
                borderRadius: 24,
                fontSize: 14,
                outline: 'none',
                color: 'var(--text)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card)';
                e.currentTarget.style.border = '1px solid #667eea';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg)';
                e.currentTarget.style.border = '1px solid transparent';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
              }}
            />
          </div>
        </div>

        {/* Actions à droite */}
        <div
          className="nav-right"
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          {/* + Ask */}
          {onAskClick && (
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  onLoginClick();
                  return;
                }
                if (onAskClick) onAskClick();
                else router.push('/ask');
              }}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 999,
                color: 'white',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(102,126,234,0.3)',
                whiteSpace: 'nowrap',
              }}
              aria-label="Ask a question"
              title="+ Ask"
            >
              + Ask
            </button>
          )}

          {/* Cloche notifications */}
          <button
            aria-label="Notifications"
            title="Notifications"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <Bell size={18} />
            {notificationsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: 18,
                  height: 18,
                  padding: '0 4px',
                  borderRadius: 999,
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--card)',
                  lineHeight: 1,
                }}
              >
                {notificationsCount > 99 ? '99+' : notificationsCount}
              </span>
            )}
          </button>

          {/* Langues via icône Globe + popover */}
          <div style={{ position: 'relative' }}>
            <button
              ref={langBtnRef}
              onClick={() => setShowLang((s) => !s)}
              aria-label="Language"
              title="Language"
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                border: '1px solid var(--border)',
                background: 'var(--card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Globe size={18} />
            </button>

            {showLang && (
              <div
                ref={langMenuRef}
                style={{
                  position: 'absolute',
                  top: 44,
                  right: 0,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  padding: 6,
                  minWidth: 140,
                  zIndex: 200,
                }}
              >
                {[
                  { v: 'en', label: 'English' },
                  { v: 'fr', label: 'Français' },
                  { v: 'es', label: 'Español' },
                  { v: 'de', label: 'Deutsch' },
                  { v: 'it', label: 'Italiano' },
                  { v: 'pt', label: 'Português' },
                ].map((item) => (
                  <button
                    key={item.v}
                    onClick={() => onLang(item.v)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: lang === item.v ? 'var(--pill)' : 'transparent',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span>{item.label}</span>
                    {lang === item.v ? <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} /> : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme (icône seule) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Auth */}
          {!isLoggedIn ? (
            !isMobile && (
              <button
                onClick={onLoginClick}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '2px solid #667eea',
                  borderRadius: 999,
                  color: '#667eea',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Log in
              </button>
            )
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                paddingLeft: 4,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  backgroundColor: 'var(--bg)',
                  borderRadius: 24,
                  cursor: 'pointer',
                }}
                title="Account"
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}
                >
                  {username?.[0]?.toUpperCase() || 'U'}
                </div>
                {!isMobile && (
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                    {username}
                  </span>
                )}
                <ChevronDown size={16} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
