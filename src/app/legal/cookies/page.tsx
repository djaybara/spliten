'use client';
import { useState } from 'react';

export default function CookiesPage() {
  const [lang, setLang] = useState<'fr'|'en'>('fr');

  return (
    <main style={{maxWidth:900, margin:'0 auto', padding:16}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <h1 style={{fontSize:24, fontWeight:800}}>Cookies</h1>
        <select value={lang} onChange={e=>setLang(e.target.value as any)} style={{border:'1px solid var(--border)', borderRadius:8, padding:'6px 10px'}}>
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>
      </div>

      {lang==='fr' ? (
        <>
          <h2>Catégories</h2>
          <ul>
            <li>Nécessaires : session, sécurité, anti-bot (Turnstile).</li>
            <li>Préférences : thème (clair/sombre), langue.</li>
            <li>Mesure d’audience : analytics (anonymisés si requis).</li>
          </ul>
          <h2>Gestion</h2>
          <p>Vous pouvez gérer vos préférences via les paramètres du navigateur et notre bannière de consentement (lorsqu’activée).</p>
        </>
      ) : (
        <>
          <h2>Categories</h2>
          <ul>
            <li>Necessary: session, security, anti-bot (Turnstile).</li>
            <li>Preferences: theme, language.</li>
            <li>Analytics: anonymised where required.</li>
          </ul>
          <h2>Control</h2>
          <p>Manage via your browser settings and our consent banner (when enabled).</p>
        </>
      )}
    </main>
  );
}
