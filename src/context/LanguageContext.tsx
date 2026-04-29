import React, { createContext, useContext, useState, useEffect } from 'react';

export type DisplayLanguage = 'English' | 'Romaji';

interface LanguageContextType {
  displayLanguage: DisplayLanguage;
  toggleLanguage: () => void;
  setLanguage: (lang: DisplayLanguage) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [displayLanguage, setDisplayLanguage] = useState<DisplayLanguage>(() => {
    const saved = localStorage.getItem('sekta_language');
    return (saved as DisplayLanguage) || 'English';
  });

  useEffect(() => {
    localStorage.setItem('sekta_language', displayLanguage);
  }, [displayLanguage]);

  const toggleLanguage = () => {
    setDisplayLanguage(prev => prev === 'English' ? 'Romaji' : 'English');
  };

  const setLanguage = (lang: DisplayLanguage) => {
    setDisplayLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ displayLanguage, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
