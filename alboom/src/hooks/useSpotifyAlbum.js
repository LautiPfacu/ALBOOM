// Datos de un disco de Spotify (portada, canciones, duración).
//
//   const { album, loading, error, retry } = useSpotifyAlbum(albumId);

import { useCallback, useEffect, useState } from 'react';
import { getAlbum } from '../services/spotify';

export function useSpotifyAlbum(albumId) {
  // Cada intento tiene una clave (id + número de intento). Si la clave guardada no coincide
  // con la actual, todavía estamos esperando la respuesta: eso es "cargando".
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ key: null, album: null, error: null });
  const key = `${albumId}:${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    getAlbum(albumId, { signal: controller.signal })
      .then((album) => setState({ key, album, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ key, album: null, error: error.message });
      });
    // Si cambia el disco o se desmonta la página, cancelamos el pedido viejo.
    return () => controller.abort();
  }, [albumId, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const loading = state.key !== key;
  return {
    album: loading ? null : state.album,
    loading,
    error: loading ? null : state.error,
    retry,
  };
}
