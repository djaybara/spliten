'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Moon, Sun, Bell, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES, type SupportedLanguage } from '@/lib/i18n/translations';

type NavbarProps = {
  isMobile: boolean;
  isLoggedIn: boolean;
  username?: string;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onAskClick?: () => void;
  notificationsCount?: number;
};

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved as 'light' | 'dark';
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function ThemeIcon({ size = 16 }: { size?: number }) {
  return (
    <span
      className="theme-icon inline-flex items-center justify-center"
      aria-hidden="true"
      suppressHydrationWarning
      style={{ width: size, height: size }}
    >
      <span data-sun><Sun width={size} height={size} /></span>
      <span data-moon><Moon width={size} height={size} /></span>
    </span>
  );
}

export default function Navbar({
  isMobile,
  isLoggedIn,
  username = 'user',
  searchQuery,
  onSearchChange,
  onLoginClick,
  onSignupClick,
  onAskClick,
  notificationsCount = 0,
}: NavbarProps) {
  /* ================= THEME ================= */
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme as any;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  const router = useRouter();

  /* ================ LANG MENU (Context) ================ */
  const { language, setLanguage, t } = useLanguage();
  const [showLang, setShowLang] = useState(false);
  const langBtnRef = useRef<HTMLButtonElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  const onLang = (v: SupportedLanguage) => {
    setLanguage(v);
    setShowLang(false);
  };

  // Fermer le menu en cliquant en dehors
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (!langMenuRef.current || !langBtnRef.current) return;
      if (!langMenuRef.current.contains(target) && !langBtnRef.current.contains(target)) {
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
        {/* Logo Spliten - LARGEUR FIXE */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            flexShrink: 0, // ← Ne rétrécit jamais
            width: isMobile ? 36 : 130, // ← Largeur fixe
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
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
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
              placeholder={isMobile ? t.search || 'Search...' : t.searchPlaceholder || 'Search questions, topics, or categories'}
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
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            minWidth: 'fit-content', // ← Empêche le shrink
          }}
        >
          {/* + Ask - TRADUIT */}
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
                minWidth: 110, // ← Augmenté pour le texte le plus long
                textAlign: 'center',
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
              aria-label={t.askQuestion}
              title={t.askQuestion}
            >
              {/* Affiche "+ Ask" en anglais, "+ Poser" en français, etc. */}
              {language === 'en' ? '+ Ask' : 
               language === 'fr' ? '+ Poser' :
               language === 'es' ? '+ Preguntar' :
               language === 'de' ? '+ Fragen' :
               language === 'it' ? '+ Chiedi' :
               language === 'pt' ? '+ Perguntar' : '+ Ask'}
            </button>
          )}

          {/* Cloche notifications */}
          <button
            aria-label={t.notifications || "Notifications"}
            title={t.notifications || "Notifications"}
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

          {/* Langues avec DRAPEAUX - AMÉLIORÉ */}
          <div style={{ position: 'relative' }}>
            <button
              ref={langBtnRef}
              onClick={() => setShowLang((s) => !s)}
              aria-label={t.language || "Language"}
              title={LANGUAGES[language].name}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                border: showLang ? '1px solid #667eea' : '1px solid var(--border)',
                background: 'var(--card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 20,
                transition: 'all 0.2s ease',
              }}
            >
              {LANGUAGES[language].flag}
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
                  minWidth: 160,
                  zIndex: 200,
                  animation: 'fadeIn 0.15s ease',
                }}
              >
                {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => onLang(lang)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: language === lang ? 'var(--pill)' : 'transparent',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (language !== lang) {
                        e.currentTarget.style.background = 'var(--bg)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (language !== lang) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{LANGUAGES[lang].flag}</span>
                    <span style={{ flex: 1 }}>{LANGUAGES[lang].name}</span>
                    {language === lang && (
                      <span style={{ color: '#667eea', fontSize: 16, fontWeight: 'bold' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            aria-label={t.toggleTheme || "Toggle theme"}
            title={t.toggleTheme || "Toggle theme"}
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
              transition: 'all 0.2s ease',
            }}
          >
            <ThemeIcon size={16} />
          </button>

          {/* Auth */}
          {!isLoggedIn ? (
            !isMobile && (
              <button
                onClick={onLoginClick}
                style={{
                  padding: '8px 16px',
                  minWidth: 120, // ← Augmenté pour "Iniciar Sesión" (le plus long)
                  textAlign: 'center',
                  backgroundColor: 'transparent',
                  border: '2px solid #667eea',
                  borderRadius: 999,
                  color: '#667eea',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#667eea';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#667eea';
                }}
              >
                {t.login}
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
                  transition: 'all 0.2s ease',
                }}
                title={t.account || "Account"}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--pill)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg)';
                }}
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

      <style jsx global>{`
        .theme-icon [data-sun],
        .theme-icon [data-moon] { display: none !important; }
        html[data-theme="light"] .theme-icon [data-moon] { display: inline-flex !important; }
        html[data-theme="dark"]  .theme-icon [data-sun]  { display: inline-flex !important; }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}