'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, TranslationSchema } from './types';
import { en } from './dictionaries/en';
import { mr } from './dictionaries/mr';
import { hi } from './dictionaries/hi';

const dictionaries: Record<Language, TranslationSchema> = {
  en,
  mr,
  hi,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, replacements?: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'cropLinkLanguage';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Initialize from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === 'en' || saved === 'mr' || saved === 'hi')) {
        setLanguageState(saved);
        document.documentElement.lang = saved;
      } else {
        document.documentElement.lang = 'en';
      }
    } catch (e) {
      console.warn('Could not read cropLinkLanguage from localStorage', e);
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch (e) {
      console.warn('Could not save cropLinkLanguage to localStorage', e);
    }
  }, []);

  const t = useCallback((keyPath: string, replacements?: Record<string, string | number>): string => {
    const keys = keyPath.split('.');
    
    // Attempt lookup in active dictionary
    let result: any = dictionaries[language];
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        result = undefined;
        break;
      }
    }

    // Fallback to English dictionary if missing in target dictionary
    if (result === undefined && language !== 'en') {
      let fallback: any = dictionaries.en;
      for (const k of keys) {
        if (fallback && typeof fallback === 'object' && k in fallback) {
          fallback = fallback[k];
        } else {
          fallback = undefined;
          break;
        }
      }
      result = fallback;
    }

    if (typeof result !== 'string') {
      return keyPath; // Return key string as safety fallback
    }

    // Process replacements e.g. {farmName}
    if (replacements) {
      Object.entries(replacements).forEach(([param, value]) => {
        result = (result as string).replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
      });
    }

    return result;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
