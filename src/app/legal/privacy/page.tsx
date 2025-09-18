'use client';
import { useState } from 'react';

export default function PrivacyPage() {
  const [lang, setLang] = useState<'fr'|'en'>('fr');

  return (
    <main style={{maxWidth:900, margin:'0 auto', padding:16}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <h1 style={{fontSize:24, fontWeight:800}}>Privacy / Confidentialité</h1>
        <select value={lang} onChange={e=>setLang(e.target.value as any)} style={{border:'1px solid var(--border)', borderRadius:8, padding:'6px 10px'}}>
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>
      </div>

      {lang==='fr' ? (
        <>
          <p>Dernière mise à jour : 12/09/2025</p>
          <h2>1. Responsable de traitement</h2>
          <p>Spliten (contact : privacy@spliten.com).</p>
          <h2>2. Données collectées</h2>
          <ul>
            <li>Compte (email, pseudo), contenus publiés, logs techniques.</li>
            <li>Cookies nécessaires + analytiques (anonymisés si requis).</li>
          </ul>
          <h2>3. Finalités</h2>
          <ul>
            <li>Fournir le service (auth, modération, sécurité).</li>
            <li>Amélioration produit et statistiques agrégées.</li>
          </ul>
          <h2>4. Bases légales</h2>
          <p>Contrat, intérêt légitime, consentement (pour certains cookies), obligation légale.</p>
          <h2>5. Droits RGPD</h2>
          <p>Accès, rectification, effacement, opposition, portabilité, limitation ; réclamation : autorité locale.</p>
          <h2>6. Transferts</h2>
          <p>Hébergement UE/EEE ou équivalents avec clauses contractuelles types.</p>
          <h2>7. Conservation</h2>
          <p>Données de compte : pendant l’usage ; logs : 12 mois ; contenus : selon besoins légitimes.</p>
          <h2>8. Sécurité</h2>
          <p>Chiffrement en transit, contrôle d’accès, journalisation.</p>
        </>
      ) : (
        <>
          <p>Last updated: 2025-09-12</p>
          <h2>1. Controller</h2>
          <p>Spliten (contact: privacy@spliten.com).</p>
          <h2>2. Data we collect</h2>
          <ul>
            <li>Account (email, handle), content posted, technical logs.</li>
            <li>Necessary cookies + analytics (anonymised where required).</li>
          </ul>
          <h2>3. Purposes</h2>
          <ul>
            <li>Provide service (auth, moderation, security).</li>
            <li>Product improvement and aggregated stats.</li>
          </ul>
          <h2>4. Legal bases</h2>
          <p>Contract, legitimate interest, consent (some cookies), legal obligation.</p>
          <h2>5. Your rights</h2>
          <p>Access, rectification, deletion, objection, portability, restriction; complaint to your DPA.</p>
          <h2>6. Transfers</h2>
          <p>EU/EEA hosting or SCCs as appropriate.</p>
          <h2>7. Retention</h2>
          <p>Account: while active; logs: 12 months; content: as legitimately needed.</p>
          <h2>8. Security</h2>
          <p>TLS in transit, access controls, auditing.</p>
        </>
      )}
    </main>
  );
}
