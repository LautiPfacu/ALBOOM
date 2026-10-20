// Tarjeta de género de la primera vez. Elegida: fondo de acento, sombra y estallido.

import BurstMark from './BurstMark';
import './GenreTile.css';

export default function GenreTile({ label, selected, onToggle }) {
  return (
    <button type="button" className="genre-tile" aria-pressed={selected} onClick={onToggle}>
      {selected ? (
        <>
          <span className="genre-tile__dots" aria-hidden="true" />
          <BurstMark className="genre-tile__burst" />
        </>
      ) : (
        <span className="genre-tile__circle" aria-hidden="true" />
      )}
      <span className="genre-tile__label">{label}</span>
    </button>
  );
}
