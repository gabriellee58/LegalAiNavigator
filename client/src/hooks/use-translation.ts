import { useState, useEffect } from 'react';
import { translations, getLanguage, setLanguage as setLang } from '@/lib/i18n';

interface TranslationHook {
  t: (key: string, replacements?: Record<string, string>) => string;
  currentLanguage: string;
  setLanguage: (language: string) => void;
}

/**
 * Hook to use translations
 * @returns Translation utilities
 */
export function useTranslation(): TranslationHook {
  const [currentLanguage, setCurrentLanguage] = useState(getLanguage());

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(getLanguage());
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  /**
   * Translate a key
   * @param key Translation key
   * @param replacements Object with replacements (e.g. {name: 'John'} for translating 'Hello, {{name}}')
   * @returns Translated string or the key if not found
   */
  const t = (key: string, replacements?: Record<string, string>): string => {
    // Get translations for current language or fall back to English
    const languageTranslations = translations[currentLanguage] || translations.en;
    
    // Get the translated string or use the key as fallback
    let translatedString = languageTranslations[key] || key;
    
    // Replace placeholders if replacements are provided
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translatedString = translatedString.replace(`{{${placeholder}}}`, value);
      });
    }
    
    return translatedString;
  };

  return {
    t,
    currentLanguage,
    setLanguage: setLang,
  };
}