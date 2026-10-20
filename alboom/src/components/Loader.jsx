// Logo animado de carga + texto debajo.
//   <Loader size={64} label="Buscando discos…" />
// <alboom-loader> es un web component (components/alboom-loader.js, importado en main.jsx).
// Sin colores toma --ink, --pink y --paper, así que sigue al tema.

import './Loader.css';

export default function Loader({ size = 64, label, className = '' }) {
  return (
    <div className={`loader ${className}`}>
      <alboom-loader size={size} aria-label={label ?? 'Cargando'} />
      {label && (
        <span className="loader__label" aria-hidden="true">
          {label}
        </span>
      )}
    </div>
  );
}
