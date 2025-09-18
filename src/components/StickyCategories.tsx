'use client';

import React from 'react';
import CategoriesPanel from '@/components/CategoriesPanel';

type Props = {
  selected: string;
  onSelect: (val: string) => void;
  /** Offset sticky sous la navbar (par défaut 80 pour matcher ta colonne gauche) */
  top?: number;
  /** Largeur de la colonne (défaut 240) */
  width?: number;
};

export default function StickyCategories({
  selected,
  onSelect,
  top = 80,
  width = 240,
}: Props) {
  return (
    <aside
      style={{
        width,
        position: 'sticky',
        top,
        height: 'fit-content',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
      }}
    >
      <CategoriesPanel selected={selected as any} onSelect={onSelect} title="Categories" />
    </aside>
  );
}
