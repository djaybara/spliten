// src/app/providers.tsx
'use client';
import React from 'react';

// 👇 Panic switch DEV : ne pas initialiser Clerk du tout
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
