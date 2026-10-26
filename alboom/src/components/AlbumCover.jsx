// Portada de un disco. Si no hay imagen o falla la carga, muestra un placeholder con trama.
//
//   <AlbumCover src={album.cover} name={album.name} artist={album.artist} />

import { useState } from 'react';
import './AlbumCover.css';
import { useT } from '../i18n/LanguageContext';

export default function AlbumCover({ src, name, artist, className = '' }) {
  const t = useT();
  // Guardamos qué URL falló (no un booleano): si cambia src, se vuelve a intentar sola.
  const [failedSrc, setFailedSrc] = useState(null);
  const alt = t('Portada de {name} de {artist}', { name, artist });
  const showImage = Boolean(src) && src !== failedSrc;

  return (
    <div className={`album-cover ${className}`}>
      {showImage ? (
        <img
          className="album-cover__img"
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div className="album-cover__placeholder" role="img" aria-label={alt} />
      )}
    </div>
  );
}
