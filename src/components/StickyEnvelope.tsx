'use client';

import React from 'react';

type Props = {
  top: number;        // offset sous la navbar (même que vos éléments sticky)
  above: number;      // hauteur du masque au-dessus (gap navbar -> barre/bouton)
  below: number;      // hauteur du masque en dessous (gap barre/bouton -> contenu)
  hideOnMobile?: boolean;
};

export default function StickyEnvelope({ top, above, below, hideOnMobile = true }: Props) {
  // Masque du haut: colle sous la navbar et recouvre exactement "above"
  // Masque du bas: colle juste après l'élément sticky et recouvre "below"
  // pointerEvents:none pour ne jamais bloquer l'UI
  return (
    <>
      {/* Haut */}
      <div
        aria-hidden
        style={{
          position: 'sticky',
          top: hideOnMobile ? top : 0,
          height: above,
          background: 'var(--bg)',
          zIndex: 59,            // sous les éléments sticky (60+), au-dessus du flux
          pointerEvents: 'none',
          marginBottom: -above,  // ne crée pas de hauteur visuelle
          display: hideOnMobile ? 'block' : 'block',
        }}
      />
      {/* Bas */}
      <div
        aria-hidden
        style={{
          position: 'sticky',
          top: (hideOnMobile ? (top + above) : (above)), // juste sous l’élément sticky
          height: below,
          background: 'var(--bg)',
          zIndex: 59,
          pointerEvents: 'none',
          marginBottom: -below,
          display: hideOnMobile ? 'block' : 'block',
        }}
      />
    </>
  );
}
