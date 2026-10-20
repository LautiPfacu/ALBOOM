// Tarjeta del perfil: avatar, nombre, @usuario, "desde" y 3 números (discos, reseñas, promedio).

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { isPublishable } from '../services/library';
import { formatMonthYear } from '../utils/text';
import { photoFor } from '../services/profile';
import { formatRating } from './VinylRating';
import Avatar from './Avatar';
import './ProfileSummary.css';

export default function ProfileSummary({ compact = false }) {
  const { user, profile, displayName } = useAuth();
  const { items } = useLibrary();

  // Los números se calculan a partir de la biblioteca: no se guardan aparte.
  const stats = useMemo(() => {
    const rated = items.filter((item) => item.rating > 0);
    const average = rated.length ? rated.reduce((sum, item) => sum + item.rating, 0) / rated.length : 0;
    return {
      albums: items.length,
      reviews: items.filter(isPublishable).length,
      average: average ? formatRating(Math.round(average * 10) / 10) : '—',
    };
  }, [items]);

  const since = profile?.createdAt ? formatMonthYear(profile.createdAt) : '';
  const photoURL = photoFor(profile, user);

  if (compact) {
    return (
      <div className="profile-summary profile-summary--compact">
        <Avatar name={displayName} photoURL={photoURL} size={64} display />
        <div className="profile-summary__who">
          <span className="profile-summary__name">{displayName}</span>
          {profile?.username && <span className="profile-summary__handle">@{profile.username}</span>}
          <span className="profile-summary__inline-stats">
            {stats.albums} discos · {stats.reviews} reseñas · {stats.average}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-summary">
      <Avatar name={displayName} photoURL={photoURL} size={96} display />
      <span className="profile-summary__name">{displayName}</span>
      <span className="profile-summary__handle">
        {profile?.username && `@${profile.username}`}
        {profile?.username && since && ' · '}
        {since && `desde ${since}`}
      </span>
      <dl className="profile-summary__stats">
        <div>
          <dt>discos</dt>
          <dd>{stats.albums}</dd>
        </div>
        <div>
          <dt>reseñas</dt>
          <dd>{stats.reviews}</dd>
        </div>
        <div>
          <dt>promedio</dt>
          <dd>{stats.average}</dd>
        </div>
      </dl>
    </div>
  );
}
