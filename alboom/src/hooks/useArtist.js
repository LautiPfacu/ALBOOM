// Artista de Spotify y sus discos (para "Sobre el artista").
//   const { artist, albums, loading } = useArtist(artistId);

import { useEffect, useState } from 'react';
import { getArtist } from '../services/spotify';

export function useArtist(artistId) {
  const [state, setState] = useState({ artistId: null, artist: null, albums: [] });

  useEffect(() => {
    if (!artistId) return undefined;
    const controller = new AbortController();
    getArtist(artistId, { signal: controller.signal })
      .then(({ artist, albums }) => setState({ artistId, artist, albums }))
      .catch((error) => {
        // Si falla, la sección simplemente no se muestra.
        if (error.name !== 'AbortError') setState({ artistId, artist: null, albums: [] });
      });
    return () => controller.abort();
  }, [artistId]);

  const loading = Boolean(artistId) && state.artistId !== artistId;
  return {
    artist: loading ? null : state.artist,
    albums: loading ? [] : state.albums,
    loading,
  };
}
