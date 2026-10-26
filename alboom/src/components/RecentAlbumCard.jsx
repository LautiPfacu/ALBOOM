// Tarjeta de "Lo último en tu biblioteca": toda la tarjeta es un link a la página del disco.

import { Link } from 'react-router-dom';
import AlbumCover from './AlbumCover';
import MiniRating from './MiniRating';
import './RecentAlbumCard.css';
import { useT } from '../i18n/LanguageContext';

export default function RecentAlbumCard({ item }) {
  const t = useT();
  return (
    <Link to={`/disco/${item.id}`} className="recent-album-card">
      <AlbumCover src={item.cover} name={item.name} artist={item.artist} className="recent-album-card__cover" />
      <div className="recent-album-card__info">
        <span className="recent-album-card__title">{item.name}</span>
        <span className="recent-album-card__artist">{item.artist}</span>
        {item.rating > 0 ? (
          <MiniRating value={item.rating} />
        ) : (
          <span className="chip chip--listened recent-album-card__chip">{t('Sin puntaje')}</span>
        )}
      </div>
    </Link>
  );
}
