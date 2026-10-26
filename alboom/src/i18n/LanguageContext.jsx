// Idioma de la app (español / inglés).
//   const t = useT();   t('Guardar') → 'Save' en inglés
//   const { language, changeLanguage } = useLanguage();
// La preferencia se guarda en el navegador (localStorage), así vale también antes de iniciar sesión.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getLanguage, setLanguage, translate } from './language';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getLanguage);

  // <html lang="…"> para lectores de pantalla y para el traductor del navegador.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = useCallback((next) => {
    setLanguage(next);
    setLanguageState(next);
  }, []);

  const value = useMemo(
    () => ({
      language,
      changeLanguage,
      t: (text, vars) => translate(text, vars, language),
    }),
    [language, changeLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage tiene que usarse dentro de <LanguageProvider>.');
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useT() {
  return useLanguage().t;
}
