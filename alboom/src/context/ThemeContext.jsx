// Tema de la app (Historieta, Garage, Psicodelia o Medianoche).
// Lee users/{uid}.theme y lo aplica en <html data-theme="…">: las variables de themes.css hacen el resto.
// En /login y /bienvenida siempre se ve Historieta.

import { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { DEFAULT_THEME } from '../data/themes';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { profile } = useAuth();
  const { pathname } = useLocation();

  const userTheme = profile?.theme ?? DEFAULT_THEME;
  const forceDefault = pathname === '/login' || pathname.startsWith('/bienvenida');
  const theme = forceDefault ? DEFAULT_THEME : userTheme;

  // Sincroniza el atributo del <html> con el tema (Historieta = sin atributo).
  useEffect(() => {
    const root = document.documentElement;
    if (theme === DEFAULT_THEME) delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(() => ({ theme, userTheme }), [theme, userTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme tiene que usarse dentro de <ThemeProvider>.');
  return context;
}
