// Tarjeta de disco para grillas: portada, nombre, subtítulo y puntaje de la comunidad.
//
//   <AlbumTile album={album} stats={{ average: 4.3, count: 128 }} listened />
//   <AlbumTile album={album} rank={1} meta="+12 esta semana" />
//   <AlbumTile album={album} reason="Porque te gustó Bocanada" onDismiss={hide} />
//
// listened: marca verde ✓ "Ya lo escuchaste" sobre la portada.
// reason: por qué se recomienda (en "Para vos").
// onDismiss: muestra el botón × "No me interesa".

import { Link } from 'react-router-dom';
import AlbumCover from './AlbumCover';
import { useT } from '../i18n/LanguageContext';
import { plural } from '../utils/text';
import MiniRating from './MiniRating';
import './AlbumTile.css';

export default function AlbumTile({
  album,
  stats,
  listened = false,
  rank,
  meta,
  subtitle,
  reason,
  onDismiss,
  compact = false,
}) {
  const t = useT();
  const albumUrl = `/disco/${album.id}`;
  const sub = subtitle ?? [album.artist, album.year].filter(Boolean).join(' · ');

  return (
    <article className={`album-tile${rank ? ' album-tile--ranked' : ''}${compact ? ' album-tile--compact' : ''}`}>
      <div className="album-tile__cover-wrap">
        <Link to={albumUrl} tabIndex={-1} aria-hidden="true">
          <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="album-tile__cover" />
        </Link>
        {listened && (
          <span className="album-tile__listened" title={t('Ya lo escuchaste')}>
            <span aria-hidden="true">✓</span>
            <span className="visually-hidden">{t('Ya lo escuchaste')}</span>
          </span>
        )}
        {rank && (
          <span className="album-tile__rank" aria-hidden="true">
            {rank}
          </span>
        )}
        {onDismiss && (
          <button
            type="button"
            className="album-tile__dismiss"
            title={t('No me interesa')}
            aria-label={t('No me interesa {name}', { name: album.name })}
            onClick={() => onDismiss(album)}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
      <div className="album-tile__info">
        {reason && <span className="album-tile__reason">{reason}</span>}
        <h3 className="album-tile__title">
          <Link to={albumUrl}>
            {rank && <span className="visually-hidden">{t('Puesto {rank}: ', { rank })}</span>}
            {album.name}
          </Link>
        </h3>
        {sub && <p className="album-tile__sub">{sub}</p>}
      </div>
      {(stats?.count > 0 || meta) && (
        <div className="album-tile__stats">
          {stats?.count > 0 && (
            <MiniRating value={Math.round(stats.average * 10) / 10} size={16} label={t('Promedio de la comunidad')} />
          )}
          <span className="album-tile__count">
            {meta ?? `· ${plural(stats.count, 'reseña')}`}
          </span>
        </div>
      )}
    </article>
  );
}
