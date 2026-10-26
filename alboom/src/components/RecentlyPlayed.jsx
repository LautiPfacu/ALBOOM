// "Escuchado recientemente" (desde Spotify): últimos discos únicos, con hace cuánto.

import { Link } from 'react-router-dom';
import { timeAgo } from '../utils/text';
import AlbumCover from './AlbumCover';
import { useT } from '../i18n/LanguageContext';
import './SideCard.css';
import './RecentlyPlayed.css';

export default function RecentlyPlayed({ albums }) {
  const t = useT();
  if (!albums?.length) return null;

  return (
    <section className="recently-played" aria-labelledby="recently-played-title">
      <div className="recently-played__header">
        <h2 id="recently-played-title" className="recently-played__title">
          {t('Escuchado recientemente')}
        </h2>
        <span className="side-card__badge">{t('desde Spotify')}</span>
      </div>
      <ul className="recently-played__list">
        {albums.map((album) => (
          <li key={album.albumId}>
            <Link to={`/disco/${album.albumId}`} className="recently-played__item">
              <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="recently-played__cover" />
              <span className="recently-played__time">{timeAgo(new Date(album.playedAt))}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
