// Página de disco (pantalla 9).
// Datos: Spotify (useSpotifyAlbum), tu biblioteca (useLibraryItem) y la comunidad (useAlbumReviews).

import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAlbumReviews } from '../hooks/useAlbumReviews';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useLibraryItem } from '../hooks/useLibraryItem';
import { useSpotifyAlbum } from '../hooks/useSpotifyAlbum';
import { libraryErrorMessage, removeFromLibrary } from '../services/library';
import { formatAlbumDuration } from '../services/spotify';
import { plural } from '../utils/text';
import AlbumCover from '../components/AlbumCover';
import ArtistSection from '../components/ArtistSection';
import Button from '../components/Button';
import CommunityScore from '../components/CommunityScore';
import CommunitySection from '../components/CommunitySection';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorState from '../components/ErrorState';
import ListeningCard from '../components/ListeningCard';
import Loader from '../components/Loader';
import TrackList from '../components/TrackList';
import './AlbumPage.css';

export default function AlbumPage() {
  const { albumId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { album, loading, error, retry } = useSpotifyAlbum(albumId);
  const { item, loading: itemLoading } = useLibraryItem(albumId);
  const community = useAlbumReviews(albumId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const { run: runRemove, pending: removing } = useAsyncAction(() => removeFromLibrary(user.uid, albumId));

  // "← Volver": si entraste desde otra pantalla de ALBOOM vuelve atrás; si abriste el link directo, va al inicio.
  function goBack() {
    if (location.key !== 'default') navigate(-1);
    else navigate('/');
  }

  async function confirmRemove() {
    try {
      await runRemove();
      showToast({ type: 'success', message: `Quitaste ${album?.name ?? 'el disco'} de tu biblioteca.` });
      setConfirmOpen(false); // te quedás en la página: "Tu escucha" vuelve a "no guardado"
    } catch (removeError) {
      showToast({ type: 'error', message: libraryErrorMessage(removeError) });
    }
  }

  const backButton = (
    <button type="button" className="album-page__back" onClick={goBack}>
      <span aria-hidden="true">←</span>
      <span className="album-page__back-text">Volver</span>
    </button>
  );

  if (loading) {
    return (
      <div className="album-page page">
        <div className="album-page__topbar">{backButton}</div>
        <Loader size={64} label="Cargando disco…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="album-page page">
        <div className="album-page__topbar">{backButton}</div>
        <ErrorState message={error} onRetry={retry}>
          <Button to="/" variant="secondary">
            Volver al inicio
          </Button>
        </ErrorState>
      </div>
    );
  }

  const longTitle = album.name.length > 24;
  const spotifyLink = (className) =>
    album.spotifyUrl && (
      <a href={album.spotifyUrl} target="_blank" rel="noopener noreferrer" className={className}>
        Abrir en Spotify <span aria-hidden="true">↗</span>
      </a>
    );

  return (
    <div className="album-page page">
      <div className="album-page__topbar">
        {backButton}
        {spotifyLink('album-page__spotify-pill')}
      </div>

      <div className="album-page__layout">
        <div className="album-page__aside">
          <div className="album-page__cover-wrap">
            <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="album-page__cover" />
            <div className="album-page__tape" aria-hidden="true" />
          </div>
          {spotifyLink('btn btn--secondary btn--md album-page__spotify')}
          <div className="album-page__tracks">
            <TrackList tracks={album.tracks} durationMs={album.durationMs} />
          </div>
        </div>

        <div className="album-page__main">
          <div className="album-page__header">
            <div className="album-page__heading">
              <span className="album-page__kicker">Disco{album.year && ` · ${album.year}`}</span>
              <h1 className={`album-page__title${longTitle ? ' album-page__title--long' : ''}`}>{album.name}</h1>
              <span className="album-page__artist">{album.artist}</span>
              <span className="album-page__duration">
                <span className="album-page__year-mobile">{album.year && `${album.year} · `}</span>
                {plural(album.tracks.length, 'canción', 'canciones')} · {formatAlbumDuration(album.durationMs)}
              </span>
            </div>
            <CommunityScore summary={community.summary} loading={community.loading} />
          </div>

          <div className="album-page__listening">
            {itemLoading ? (
              <Loader size={48} label="Cargando tu escucha…" />
            ) : (
              <ListeningCard album={album} item={item} onRemove={() => setConfirmOpen(true)} />
            )}
          </div>

          <div className="album-page__community">
            <CommunitySection
              reviews={community.reviews}
              summary={community.summary}
              loading={community.loading}
              error={community.error}
              myUid={user.uid}
            />
          </div>
        </div>
      </div>

      <ArtistSection artistId={album.artistId} currentAlbumId={album.id} artistName={album.artist} />

      <ConfirmDialog
        open={confirmOpen}
        title={`¿Quitar ${album.name} de tu biblioteca?`}
        text="Se borran tu puntaje y tu reseña. No se puede deshacer."
        confirmLabel="Quitar"
        pendingLabel="Quitando…"
        pending={removing}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
