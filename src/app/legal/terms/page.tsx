'use client';
import { useState } from 'react';

export default function TermsPage() {
  const [lang, setLang] = useState<'fr'|'en'>('fr');

  return (
    <main style={{maxWidth:900, margin:'0 auto', padding:16}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <h1 style={{fontSize:24, fontWeight:800}}>Terms of Service / Conditions d’utilisation</h1>
        <select value={lang} onChange={e=>setLang(e.target.value as any)} style={{border:'1px solid var(--border)', borderRadius:8, padding:'6px 10px'}}>
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>
      </div>

      {lang==='fr' ? (
        <>
          <p>Dernière mise à jour : 12/09/2025</p>
          <h2>1. Objet</h2>
          <p>Spliten est une plateforme de débats publics. En l’utilisant, vous acceptez ces Conditions.</p>
          <h2>2. Comptes</h2>
          <p>Vous devez avoir l’âge légal de votre pays. Vous êtes responsable de votre compte et de la sécurité.</p>
          <h2>3. Contenus</h2>
          <p>Vous conservez vos droits, mais nous accordez une licence mondiale pour héberger/afficher vos contenus sur Spliten.</p>
          <h2>4. Conduite</h2>
          <p>Pas de harcèlement, doxxing, incitation à la haine, spam, ni contenus illégaux. Les modérateurs peuvent agir.</p>
          <h2>5. Données & confidentialité</h2>
          <p>Voir notre Politique de confidentialité. Nous traitons vos données selon le RGPD (si applicable).</p>
          <h2>6. Limitation de responsabilité</h2>
          <p>Spliten est fourni “en l’état”. Nous ne garantissons pas l’absence d’erreurs ou la disponibilité continue.</p>
          <h2>7. Résiliation</h2>
          <p>Nous pouvons suspendre ou fermer un compte en cas de violation.</p>
          <h2>8. Contact</h2>
          <p>Email : support@spliten.com</p>
        </>
      ) : (
        <>
          <p>Last updated: 2025-09-12</p>
          <h2>1. Purpose</h2>
          <p>Spliten is a public debate platform. By using it, you agree to these Terms.</p>
          <h2>2. Accounts</h2>
          <p>You must be of legal age in your country. You are responsible for your account and its security.</p>
          <h2>3. Content</h2>
          <p>You keep your rights and grant us a worldwide license to host/display your content on Spliten.</p>
          <h2>4. Conduct</h2>
          <p>No harassment, doxxing, hate speech, spam, or illegal content. Moderators may act.</p>
          <h2>5. Data & Privacy</h2>
          <p>See our Privacy Policy. We process data under GDPR where applicable.</p>
          <h2>6. Liability</h2>
          <p>Spliten is provided “as is”. We do not warrant error-free or uninterrupted service.</p>
          <h2>7. Termination</h2>
          <p>We may suspend/close accounts for violations.</p>
          <h2>8. Contact</h2>
          <p>Email: support@spliten.com</p>
        </>
      )}
    </main>
  );
}
