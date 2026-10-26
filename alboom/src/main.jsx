import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './i18n/LanguageContext';
import App from './App';
// Web components de la marca: se registran una sola vez.
import './components/alboom-loader.js'; // <alboom-loader>: logo de carga
import './components/alboom-motion.js'; // <alboom-explosion> (login) y <alboom-burst> (logo de la barra)
import './styles/tokens.css';
import './styles/themes.css'; // después de tokens.css: los temas pisan esas variables
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
