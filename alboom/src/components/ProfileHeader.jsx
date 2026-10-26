// Cabecera de un perfil (el tuyo o el de otra persona).
// Solo muestra datos públicos: nada de email ni ajustes.
//   isMe → "Editar perfil" + "Compartir perfil";  si no → "Seguir" + "Compartir" + chip "Te sigue"

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { genreName } from '../data/genres';
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { plural } from '../utils/text';
import Avatar from './Avatar';
import FollowButton from './FollowButton';
import FollowersDialog from './FollowersDialog';
import { useT } from '../i18n/LanguageContext';
import './ProfileHeader.css';

export default function ProfileHeader({ profile, isMe, followsYou = false, albumsCount, reviewsCount }) {
  const { showToast } = useToast();
  const t = useT();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [listOpen, setListOpen] = useState(null); // 'followers' | 'following' | null

  // "Compartir perfil": copia el link al portapapeles.
  async function handleShare() {
    const url = `${window.location.origin}/u/${profile.username}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast({ type: 'success', message: 'Copiamos el link del perfil.' });
    } catch {
      showToast({ type: 'error', message: 'No pudimos copiar el link. Probá de nuevo.' });
    }
  }

  const counts = { followers: profile.followersCount ?? 0, following: profile.followingCount ?? 0 };

  return (
    <header className="profile-header">
      <Avatar name={profile.displayName} photoURL={profile.photoURL} size={isMobile ? 76 : 150} display />
      <div className="profile-header__info">
        <div className="profile-header__name-row">
          <h1 className="profile-header__name">{profile.displayName}</h1>
          {followsYou && <span className="chip chip--listened">{t('Te sigue')}</span>}
        </div>
        <span className="profile-header__handle">@{profile.username}</span>
        {profile.bio && <p className="profile-header__bio">{profile.bio}</p>}
        {profile.genres?.length > 0 && (
          <ul className="profile-header__genres" aria-label={t('Géneros')}>
            {profile.genres.slice(0, 5).map((id) => (
              <li key={id} className="profile-header__genre">
                {genreName(id)}
              </li>
            ))}
          </ul>
        )}
        <div className="profile-header__stats">
          <button type="button" className="profile-header__stat-button" onClick={() => setListOpen('followers')}>
            <strong>{counts.followers}</strong> {counts.followers === 1 ? t('seguidor') : t('seguidores')}
          </button>
          <button type="button" className="profile-header__stat-button" onClick={() => setListOpen('following')}>
            <strong>{counts.following}</strong> {t('seguidos')}
          </button>
          {albumsCount !== undefined && (
            <span>
              <strong>{albumsCount}</strong> {albumsCount === 1 ? t('disco') : t('discos')}
            </span>
          )}
          {reviewsCount !== undefined && <span className="profile-header__reviews">{plural(reviewsCount, 'reseña')}</span>}
        </div>
      </div>

      <div className="profile-header__actions">
        {isMe ? (
          <Link to="/ajustes/cuenta" className="btn btn--secondary btn--sm">
            {t('Editar perfil')}
          </Link>
        ) : (
          <FollowButton uid={profile.uid} name={profile.displayName} />
        )}
        <button type="button" className="btn btn--secondary btn--sm" onClick={handleShare}>
          {isMe ? t('Compartir perfil') : t('Compartir')}
        </button>
      </div>

      <FollowersDialog
        open={listOpen !== null}
        onClose={() => setListOpen(null)}
        uid={profile.uid}
        initialTab={listOpen ?? 'followers'}
        counts={counts}
      />
    </header>
  );
}
