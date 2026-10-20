// Disco de la biblioteca en vista "Chica" (pantalla 8b): tapa, nombre y puntaje corto.

import { Link } from 'react-router-dom';
import { STATUS } from '../services/library';
import AlbumCover from './AlbumCover';
import MiniRating from './MiniRating';
import './LibraryCardSmall.css';

export default function LibraryCardSmall({ item }) {
  const albumUrl = `/disco/${item.id}`;

  let info;
  if (item.status === STATUS.PENDING) info = <span className="chip chip--pending library-card-small__chip">Pendiente</span>;
  else if (item.rating === 0) info = <span className="library-card-small__muted">Sin puntaje</span>;
  else info = <MiniRating value={item.rating} size={14} />;

  return (
    <article className="library-card-small">
      <Link to={albumUrl} tabIndex={-1} aria-hidden="true">
        <AlbumCover src={item.cover} name={item.name} artist={item.artist} className="library-card-small__cover" />
      </Link>
      <h3 className="library-card-small__title">
        <Link to={albumUrl}>{item.name}</Link>
      </h3>
      <div className="library-card-small__info">{info}</div>
    </article>
  );
}
