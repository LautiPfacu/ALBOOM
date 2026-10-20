// Tarjeta de disco para grillas: portada, nombre, subtítulo y puntaje de la comunidad.
//
//   <AlbumTile album={album} stats={{ average: 4.3, count: 128 }} listened />
//   <AlbumTile album={album} rank={1} meta="+12 esta semana" />
//
// listened: muestra la marca verde ✓ "Ya lo escuchaste" sobre la portada.

import { Link } from 'react-router-dom';
import AlbumCover from './AlbumCover';
import MiniRating from './MiniRating';
import './AlbumTile.css';

export default function AlbumTile({ album, stats, listened = false, rank, meta, subtitle, compact = false }) {
  const albumUrl = `/disco/${album.id}`;
  const sub = subtitle ?? [album.artist, album.year].filter(Boolean).join(' · ');

  return (
    <article className={`album-tile${rank ? ' album-tile--ranked' : ''}${compact ? ' album-tile--compact' : ''}`}>
      <div className="album-tile__cover-wrap">
        <Link to={albumUrl} tabIndex={-1} aria-hidden="true">
          <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="album-tile__cover" />
        </Link>
        {listened && (
          <span className="album-tile__listened" title="Ya lo escuchaste">
            <span aria-hidden="true">✓</span>
            <span className="visually-hidden">Ya lo escuchaste</span>
          </span>
        )}
        {rank && (
          <span className="album-tile__rank" aria-hidden="true">
            {rank}
          </span>
        )}
      </div>
      <div className="album-tile__info">
        <h3 className="album-tile__title">
          <Link to={albumUrl}>
            {rank && <span className="visually-hidden">Puesto {rank}: </span>}
            {album.name}
          </Link>
        </h3>
        {sub && <p className="album-tile__sub">{sub}</p>}
      </div>
      {(stats?.count > 0 || meta) && (
        <div className="album-tile__stats">
          {stats?.count > 0 && <MiniRating value={Math.round(stats.average * 10) / 10} size={16} label="Promedio de la comunidad" />}
          <span className="album-tile__count">
            {meta ?? `· ${stats.count === 1 ? '1 reseña' : `${stats.count} reseñas`}`}
          </span>
        </div>
      )}
    </article>
  );
}
