'use client';

export default function ThemeToggle() {
  const label =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
      ? 'Light'
      : 'Dark';

  return (
    <button
      onClick={() => {
        const root = document.documentElement;
        const isDark = root.classList.toggle('dark');
        root.setAttribute('data-theme', isDark ? 'dark' : 'light');
        try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch(_) {}
      }}
      style={{
        padding: '6px 10px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--pill)',
        color: 'var(--text)',
        cursor: 'pointer',
      }}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {label}
    </button>
  );
}