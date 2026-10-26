// Perfil de otra persona (/u/:username). Todos los perfiles son públicos.
// Solo se muestran datos públicos (profiles/{uid}), nunca su email ni sus ajustes.

import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { useUidByUsername } from '../hooks/useUidByUsername';
import { useUserLibrary } from '../hooks/useUserLibrary';
import { useUserReviews } from '../hooks/useUserReviews';
import { followsMe } from '../services/follows';
import { STATUS } from '../services/library';
import AverageCard from '../components/AverageCard';
import Button from '../components/Button';
import CommonFollowersCard from '../components/CommonFollowersCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Loader from '../components/Loader';
import MatchBanner from '../components/MatchBanner';
import ProfileHeader from '../components/ProfileHeader';
import ProfileTabs from '../components/ProfileTabs';
import RecentlyPlayed from '../components/RecentlyPlayed';
import TopFiveShelf from '../components/TopFiveShelf';
import { useT } from '../i18n/LanguageContext';
import './ProfilePage.css';

export default function UserProfilePage() {
  const { username } = useParams();
  const t = useT();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { uid, loading: uidLoading, notFound, error: uidError } = useUidByUsername(username);
  const { profile, loading: profileLoading, error } = usePublicProfile(uid);
  const { profile: me } = usePublicProfile(user.uid);
  const { items: theirLibrary, loading: libraryLoading, error: libraryError } = useUserLibrary(uid);
  const { reviews, average, loading: reviewsLoading } = useUserReviews(uid);
  const { items: myLibrary } = useLibrary();
  const followsYou = useFollowsYou(uid, user.uid);

  // Discos que ya escuchaste (para la marca verde en su Top 5).
  const myListened = useMemo(
    () => new Set(myLibrary.filter((item) => item.status === STATUS.LISTENED).map((item) => item.id)),
    [myLibrary],
  );

  function goBack() {
    if (location.key !== 'default') navigate(-1);
    else navigate('/comunidad');
  }

  if (uid && uid === user.uid) return <Navigate to="/perfil" replace />;
  if (uidLoading || profileLoading) return <Loader size={64} label="Cargando perfil…" />;
  if (uidError || error) return <div className="page"><ErrorState message={uidError ?? error} /></div>;
  if (notFound || !profile) {
    return (
      <div className="page profile-page__missing">
        <EmptyState title="No encontramos este perfil" text={t('No hay nadie con el usuario @{username}.', { username })}>
          <Button to="/comunidad" size="sm">
            Ir a Comunidad
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="profile-page page">
      <button type="button" className="profile-page__back" onClick={goBack}>
        <span aria-hidden="true">←</span> {t('Volver')}
      </button>
      <ProfileHeader
        profile={profile}
        isMe={false}
        followsYou={followsYou}
        albumsCount={theirLibrary.length}
        reviewsCount={reviews.length}
      />

      {me && <MatchBanner me={me} them={profile} />}

      <div className="profile-page__layout">
        <div className="profile-page__main">
          {profile.top5?.length > 0 && <TopFiveShelf title={t('Su Top 5')} albums={profile.top5} listenedIds={myListened} />}
          <RecentlyPlayed albums={profile.recent} />
          <ProfileTabs
            uid={uid}
            isMe={false}
            reviews={reviews}
            reviewsLoading={reviewsLoading}
            library={theirLibrary}
            libraryLoading={libraryLoading}
            libraryError={libraryError}
          />
        </div>
        <div className="profile-page__aside">
          <CommonFollowersCard uid={uid} />
          <AverageCard average={average} count={reviews.length} />
        </div>
      </div>
    </div>
  );
}

// ¿Esta persona te sigue? (para el chip "Te sigue")
function useFollowsYou(them, me) {
  const [state, setState] = useState({ them: null, value: false });
  useEffect(() => {
    if (!them) return undefined;
    let cancelled = false;
    followsMe(them, me)
      .then((value) => !cancelled && setState({ them, value }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [them, me]);
  return state.them === them && state.value;
}
