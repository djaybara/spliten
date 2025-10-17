// src/contexts/LanguageContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type SupportedLanguage, detectBrowserLanguage, getTranslations } from '@/lib/i18n/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: ReturnType<typeof getTranslations>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Charger la langue depuis localStorage ou détecter du navigateur
    const savedLang = localStorage.getItem('spliten-language') as SupportedLanguage;
    const initialLang = savedLang || detectBrowserLanguage();
    setLanguageState(initialLang);
    setMounted(true);
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('spliten-language', lang);
  };

  const t = getTranslations(language);

  // ✅ TOUJOURS fournir le Provider, même si pas encore monté
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}