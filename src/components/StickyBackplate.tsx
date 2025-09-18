'use client';

import React from 'react';

/**
 * Opaque sticky strip that keeps the area under/around sticky UI solid (no see-through on scroll).
 * Uses CSS variables so it respects dark/light (var(--bg)).
 */
export default function StickyBackplate({
  top,
  height,
  zIndex = 39,     // below your sticky tabs/button which are ~50
  radius = 0,
}: {
  top: number;     // sticky offset from viewport top
  height: number;  // strip height
  zIndex?: number;
  radius?: number;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: 'sticky',
        top,
        height,
        background: 'var(--bg)',   // follows theme
        zIndex,
        // stretch full width of the content container
        // parent (page wrapper) provides horizontal padding/margins
        borderRadius: radius,
      }}
    />
  );
}
