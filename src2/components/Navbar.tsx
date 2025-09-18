'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, Moon, Sun } from 'lucide-react';

type NavbarProps = {
  isMobile: boolean;
  isLoggedIn: boolean;
  username?: string;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
};

export default function Navbar({
  isMobile,
  isLoggedIn,
  username = 'user',
  searchQuery,
  onSearchChange,
  onLoginClick,
  onSignupClick,
}: NavbarProps) {
  // === THEME ===
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lire le thème initial posé par layout (pas d'écriture DOM ici)
    const t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') setTheme(t);
  }, []);

  const applyTheme = (next: 'light'|'dark') => {
    const root = document.documentElement;
    root.setAttribute('data-theme', next);
    root.style.colorScheme = next;
    if (next === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', next);
    setTheme(next);
  };

  const toggleTheme = () => applyTheme(theme === 'light' ? 'dark' : 'light');

  // === LANG ===
  const [lang, setLang] = useState<string>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('lang') || 'en' : 'en'
  );
  const onLang = (v: string) => { setLang(v); localStorage.setItem('lang', v); };

  return (
    <header style={{
      backgroundColor: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        maxWidth: 1400, margin: '0 auto', padding: '0 20px',
        height: 56, display: 'flex', alignItems: 'center', gap: 20
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: 20
          }}>S</div>
          {!isMobile && <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>spliten</span>}
        </Link>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 600 }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', width: 18 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isMobile ? 'Search...' : 'Search questions, topics, or categories'}
              style={{
                width: '100%', padding: '10px 14px 10px 42px',
                backgroundColor: 'var(--bg)', border: '1px solid transparent',
                borderRadius: 24, fontSize: 14, outline: 'none', color: 'var(--text)'
              }}
              onFocus={(e) => { e.currentTarget.style.backgroundColor = 'var(--card)'; e.currentTarget.style.border = '1px solid #667eea'; }}
              onBlur={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg)'; e.currentTarget.style.border = '1px solid transparent'; }}
            />
          </div>
        </div>

        {/* Right controls */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Language */}
          <select
            value={lang}
            onChange={(e) => onLang(e.target.value)}
            style={{
              padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--card)', color: 'var(--text)', fontSize: 13, cursor: 'pointer'
            }}
            aria-label="Language"
            title="Language"
          >
            <option value="en">EN</option><option value="fr">FR</option>
            <option value="es">ES</option><option value="de">DE</option>
            <option value="it">IT</option><option value="pt">PT</option>
          </select>

          {/* Dark mode */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--card)', color: 'var(--text)',
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12,
              minWidth: isMobile ? 34 : 80
            }}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {/* Placeholder avant mount pour éviter mismatch SSR/CSR */}
            {!mounted ? (
              <span style={{ width: 16, height: 16, display: 'inline-block' }} />
            ) : theme === 'dark' ? (
              <Sun size={16} />
            ) : (
              <Moon size={16} />
            )}
            {!isMobile && (
              <span style={{ minWidth: 36, textAlign: 'left' }}>
                {mounted ? (theme === 'dark' ? 'Light' : 'Dark') : '\u00A0'}
              </span>
            )}
          </button>

          {/* Auth */}
          {!isLoggedIn ? (
            <>
              {!isMobile && (
                <button
                  onClick={onLoginClick}
                  style={{
                    padding: '8px 20px', backgroundColor: 'transparent',
                    border: '2px solid #667eea', borderRadius: 24,
                    color: '#667eea', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                  }}
                >Log In</button>
              )}
              <button
                onClick={onSignupClick}
                style={{
                  padding: '8px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none', borderRadius: 24, color: 'white',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(102,126,234,0.3)'
                }}
              >Sign Up</button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', backgroundColor: 'var(--bg)', borderRadius: 24, cursor: 'pointer' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 14, fontWeight: 'bold'
                }}>{username?.[0]?.toUpperCase() || 'U'}</div>
                {!isMobile && <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{username}</span>}
                <ChevronDown size={16} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}