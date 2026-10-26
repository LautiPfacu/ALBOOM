// Pantalla completa mientras Firebase confirma la sesión: logo animado de 120 px.

import { useT } from '../i18n/LanguageContext';
import './FullPageLoader.css';

export default function FullPageLoader({ label = 'Abriendo tu ALBOOM…' }) {
  const t = useT();
  return (
    <div className="full-page-loader">
      <alboom-loader size={120} aria-label={t(label)} />
      <span className="full-page-loader__text" aria-hidden="true">
        {t(label)}
      </span>
    </div>
  );
}
