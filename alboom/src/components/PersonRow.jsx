// Fila de una persona: avatar, nombre, @usuario, un detalle opcional y "Seguir".
//   <PersonRow person={perfil} detail="Tiene 3 discos de tu Top 5" showTop5 />

import { Link } from 'react-router-dom';
import AlbumCover from './AlbumCover';
import Avatar from './Avatar';
import FollowButton from './FollowButton';
import { useT } from '../i18n/LanguageContext';
import './PersonRow.css';

export default function PersonRow({ person, detail, showTop5 = false, onNavigate }) {
  const t = useT();
  const profileUrl = `/u/${person.username}`;

  return (
    <div className="person-row">
      <Link to={profileUrl} className="person-row__avatar" tabIndex={-1} aria-hidden="true" onClick={onNavigate}>
        <Avatar name={person.displayName} photoURL={person.photoURL} size={44} colorful />
      </Link>
      <div className="person-row__info">
        <Link to={profileUrl} className="person-row__name" onClick={onNavigate}>
          {person.displayName}
          <span className="person-row__handle"> @{person.username}</span>
        </Link>
        {detail && <span className="person-row__detail">{detail}</span>}
        {showTop5 && person.top5?.length > 0 && (
          <span className="person-row__covers" aria-label={t('Su Top 5: {list}', { list: person.top5.map((a) => a.name).join(', ') })}>
            {person.top5.map((album) => (
              <AlbumCover key={album.albumId} src={album.cover} name={album.name} artist={album.artist} className="person-row__cover" />
            ))}
          </span>
        )}
      </div>
      <FollowButton uid={person.uid} name={person.displayName} />
    </div>
  );
}
