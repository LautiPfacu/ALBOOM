// Pantalla completa mientras Firebase confirma la sesión: logo animado de 120 px.

import './FullPageLoader.css';

export default function FullPageLoader({ label = 'Abriendo tu ALBOOM…' }) {
  return (
    <div className="full-page-loader">
      <alboom-loader size={120} aria-label={label} />
      <span className="full-page-loader__text" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}
