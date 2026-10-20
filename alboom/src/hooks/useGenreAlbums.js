// Discos de un género (y década) desde Spotify, con "Ver más".
//
//   const { albums, status, error, hasMore, loadMore, retry } = useGenreAlbums('rock nacional', '1980');
//
// status: 'loading' | 'loadingMore' | 'success' | 'error'
// decade: 'todas' o el año de inicio ('1960', '2000'…)

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchGenreAlbums } from '../services/spotify';

export function decadeRange(decade) {
  if (!decade || decade === 'todas') return {};
  const from = Number(decade);
  return { from, to: from + 9 };
}

export function useGenreAlbums(genre, decade) {
  // Clave del pedido actual: si la guardada no coincide, todavía está cargando.
  const [attempt, setAttempt] = useState(0);
  const key = `${genre}|${decade}|${attempt}`;
  const [state, setState] = useState({ key: null, albums: [], nextOffset: 0, hasMore: false, error: null });
  // Para qué pedido está cargando "Ver más" (si cambia el género, deja de contar solo).
  const [loadingMoreKey, setLoadingMoreKey] = useState(null);
  const moreControllerRef = useRef(null);

  // Primera página: se pide cada vez que cambia el género, la década o se reintenta.
  useEffect(() => {
    if (!genre) return undefined;
    const controller = new AbortController();
    searchGenreAlbums(genre, { ...decadeRange(decade), signal: controller.signal })
      .then(({ albums, nextOffset, hasMore }) =>
        setState({ key, albums, nextOffset, hasMore, error: null }),
      )
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ key, albums: [], nextOffset: 0, hasMore: false, error: error.message });
      });
    return () => {
      controller.abort();
      moreControllerRef.current?.abort();
    };
  }, [genre, decade, key]);

  const loadMore = useCallback(async () => {
    moreControllerRef.current?.abort();
    const controller = new AbortController();
    moreControllerRef.current = controller;
    setLoadingMoreKey(key);
    try {
      const page = await searchGenreAlbums(genre, {
        ...decadeRange(decade),
        offset: state.nextOffset,
        signal: controller.signal,
      });
      setState((prev) => {
        const known = new Set(prev.albums.map((album) => album.id));
        return {
          ...prev,
          albums: [...prev.albums, ...page.albums.filter((album) => !known.has(album.id))],
          nextOffset: page.nextOffset,
          hasMore: page.hasMore,
          error: null,
        };
      });
    } catch (error) {
      if (error.name !== 'AbortError') setState((prev) => ({ ...prev, error: error.message }));
    } finally {
      setLoadingMoreKey((current) => (current === key ? null : current));
    }
  }, [genre, decade, key, state.nextOffset]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const loading = state.key !== key;
  let status = 'success';
  if (loading) status = 'loading';
  else if (loadingMoreKey === key) status = 'loadingMore';
  else if (state.error) status = 'error';

  return {
    albums: loading ? [] : state.albums,
    status,
    error: loading ? null : state.error,
    hasMore: !loading && state.hasMore,
    loadMore,
    retry,
  };
}
