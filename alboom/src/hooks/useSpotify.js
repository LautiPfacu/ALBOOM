// Estado de tu Spotify conectado.
//   const { connected, settings, displayName, lastSync, suggestions, topArtists, refreshToken } = useSpotify();
//
// Lo público vive en users/{uid}.spotify; las sugerencias y el refresh token en
// users/{uid}/private/spotify (solo los lee el dueño).

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_SPOTIFY_SETTINGS, subscribeToSpotifyPrivate } from '../services/spotifyUser';

export function useSpotify() {
  const { user, profile } = useAuth();
  const spotify = profile?.spotify;
  const connected = spotify?.connected === true;
  const [state, setState] = useState({ uid: null, data: null });

  useEffect(() => {
    if (!connected) return undefined;
    return subscribeToSpotifyPrivate(
      user.uid,
      (data) => setState({ uid: user.uid, data }),
      () => setState({ uid: user.uid, data: null }),
    );
  }, [connected, user.uid]);

  const data = connected && state.uid === user.uid ? state.data : null;
  const settings = useMemo(
    () => ({
      useForRecommendations: spotify?.useForRecommendations ?? DEFAULT_SPOTIFY_SETTINGS.useForRecommendations,
      showRecent: spotify?.showRecent ?? DEFAULT_SPOTIFY_SETTINGS.showRecent,
      suggest: spotify?.suggest ?? DEFAULT_SPOTIFY_SETTINGS.suggest,
    }),
    [spotify?.useForRecommendations, spotify?.showRecent, spotify?.suggest],
  );

  return {
    connected,
    spotify,
    settings,
    displayName: spotify?.displayName ?? null,
    lastSync: spotify?.lastSync ?? null,
    refreshToken: data?.refreshToken ?? null,
    suggestions: data?.suggestions ?? [],
    topArtists: data?.topArtists ?? [],
    loading: connected && state.uid !== user.uid,
  };
}
