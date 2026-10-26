// Disco de la biblioteca en vista "Grande" (pantalla 8).
// En escritorio "Quitar" aparece al pasar el mouse o con el foco; en celular es una × siempre visible.

import { Link } from 'react-router-dom';
import { STATUS } from '../services/library';
import { useT } from '../i18n/LanguageContext';
import AlbumCover from './AlbumCover';
import MiniRating from './MiniRating';
import StatusChip from './StatusChip';
import VinylRating from './VinylRating';
import './LibraryCard.css';

export default function LibraryCard({ item, onRemove }) {
  const t = useT();
  const albumUrl = `/disco/${item.id}`;
  const isPending = item.status === STATUS.PENDING;

  let ratingInfo;
  if (isPending) ratingInfo = <span className="library-card__muted">{t('Para escuchar')}</span>;
  else if (item.rating === 0) ratingInfo = <span className="library-card__muted">{t('Sin puntaje')}</span>;
  else
    ratingInfo = (
      <>
        <span className="library-card__vinyls">
          <VinylRating value={item.rating} readOnly size={16} />
        </span>
        <span className="library-card__mini">
          <MiniRating value={item.rating} size={16} />
        </span>
      </>
    );

  return (
    <article className="library-card">
      <div className="library-card__cover-wrap">
        <Link to={albumUrl} tabIndex={-1} aria-hidden="true">
          <AlbumCover src={item.cover} name={item.name} artist={item.artist} className="library-card__cover" />
        </Link>
        <button
          type="button"
          className="library-card__remove"
          aria-label={t('Quitar {name} de tu biblioteca', { name: item.name })}
          onClick={() => onRemove(item)}
        >
          <span className="library-card__remove-text">{t('Quitar')}</span>
          <span className="library-card__remove-x" aria-hidden="true">
            ×
          </span>
        </button>
      </div>
      <div className="library-card__info">
        <h3 className="library-card__title">
          <Link to={albumUrl}>{item.name}</Link>
        </h3>
        <p className="library-card__meta">{[item.artist, item.year].filter(Boolean).join(' · ')}</p>
      </div>
      <div className="library-card__footer">
        {ratingInfo}
        <StatusChip status={item.status} />
      </div>
    </article>
  );
}
