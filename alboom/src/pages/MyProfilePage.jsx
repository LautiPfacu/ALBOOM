// Tu perfil (/perfil): cabecera, Mi Top 5, Escuchado recientemente (Spotify) y tu actividad.
// Columna derecha: "Desde tu Spotify" y "Gente con tus gustos".
// Lo que ve el resto de la gente es lo mismo, sin tus datos privados.

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { useSpotify } from '../hooks/useSpotify';
import { useUserReviews } from '../hooks/useUserReviews';
import ErrorState from '../components/ErrorState';
import Loader from '../components/Loader';
import PeopleSuggestionsCard from '../components/PeopleSuggestionsCard';
import ProfileHeader from '../components/ProfileHeader';
import ProfileTabs from '../components/ProfileTabs';
import RecentlyPlayed from '../components/RecentlyPlayed';
import SpotifyCard from '../components/SpotifyCard';
import TopFiveDialog from '../components/TopFiveDialog';
import TopFiveShelf from '../components/TopFiveShelf';
import { useT } from '../i18n/LanguageContext';
import './ProfilePage.css';

export default function MyProfilePage() {
  const { user } = useAuth();
  const t = useT();
  const { profile, loading, error } = usePublicProfile(user.uid);
  const { items, loading: libraryLoading } = useLibrary();
  const { reviews, loading: reviewsLoading } = useUserReviews(user.uid);
  const { connected, settings } = useSpotify();
  const [editingTop5, setEditingTop5] = useState(false);

  if (loading) return <Loader size={64} label="Cargando tu perfil…" />;
  if (error) return <div className="page"><ErrorState message={error} /></div>;
  // Recién creada la cuenta, el perfil público tarda un instante en aparecer.
  if (!profile) return <Loader size={64} label="Preparando tu perfil…" />;

  return (
    <div className="profile-page page">
      <ProfileHeader profile={profile} isMe albumsCount={items.length} reviewsCount={reviews.length} />

      <div className="profile-page__layout">
        <div className="profile-page__main">
          <TopFiveShelf title={t('Mi Top 5')} albums={profile.top5} onEdit={() => setEditingTop5(true)} />
          {connected && settings.showRecent && <RecentlyPlayed albums={profile.recent} />}
          <ProfileTabs
            uid={user.uid}
            isMe
            reviews={reviews}
            reviewsLoading={reviewsLoading}
            library={items}
            libraryLoading={libraryLoading}
          />
        </div>
        <div className="profile-page__aside">
          <SpotifyCard />
          <PeopleSuggestionsCard me={profile} />
        </div>
      </div>

      <TopFiveDialog open={editingTop5} onClose={() => setEditingTop5(false)} initial={profile.top5 ?? []} />
    </div>
  );
}
