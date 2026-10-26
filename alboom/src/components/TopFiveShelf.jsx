// Estante del Top 5: 5 tapas numeradas (círculo amarillo). Si faltan, lugares punteados.
//   <TopFiveShelf title="Mi Top 5" albums={top5} onEdit={abrir} listenedIds={setDeEscuchados} />

import { Link } from 'react-router-dom';
import { TOP5_SIZE } from '../services/publicProfile';
import AlbumCover from './AlbumCover';
import { useT } from '../i18n/LanguageContext';
import './TopFiveShelf.css';

const POSITIONS = [1, 2, 3, 4, 5];

export default function TopFiveShelf({ title, albums = [], onEdit, listenedIds, compact = false }) {
  const t = useT();
  return (
    <section className={`top-five${compact ? ' top-five--compact' : ''}`} aria-labelledby={title ? 'top-five-title' : undefined}>
      {title && (
        <div className="top-five__header">
          <h2 id="top-five-title" className="top-five__title">
            {title}
          </h2>
          {onEdit && (
            <button type="button" className="btn btn--secondary btn--sm top-five__edit" onClick={onEdit}>
              {t('Editar Top 5')}
            </button>
          )}
        </div>
      )}
      <ol className="top-five__list">
        {POSITIONS.slice(0, TOP5_SIZE).map((position) => {
          const album = albums[position - 1];
          return (
            <li key={position} className="top-five__item">
              <span className="top-five__number" aria-hidden="true">
                {position}
              </span>
              {album ? (
                <Link to={`/disco/${album.albumId}`} className="top-five__album">
                  <span className="top-five__cover-wrap">
                    <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="top-five__cover" />
                    {listenedIds?.has(album.albumId) && (
                      <span className="top-five__listened" title={t('Ya lo escuchaste')}>
                        <span aria-hidden="true">✓</span>
                        <span className="visually-hidden">{t('Ya lo escuchaste')}</span>
                      </span>
                    )}
                  </span>
                  <span className="top-five__name">{album.name}</span>
                  <span className="top-five__artist">{album.artist}</span>
                </Link>
              ) : onEdit ? (
                <button type="button" className="top-five__empty" onClick={onEdit}>
                  {t('Elegí un disco')}
                </button>
              ) : (
                <span className="top-five__empty top-five__empty--static">{t('Lugar libre')}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
