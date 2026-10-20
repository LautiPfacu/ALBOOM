// Búsqueda de discos en Spotify (a través de /api/spotify), con paginado.
//
//   const { query, results, total, status, error, hasMore, search, loadMore, reset } = useAlbumSearch();
//
// status: 'idle' | 'loading' | 'loadingMore' | 'success' | 'error'

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchAlbums } from '../services/spotify';
import { matchesQuery } from '../utils/text';

// Spotify en modo desarrollo devuelve 10 por pedido; ofrecemos hasta 50 en total.
const MAX_RESULTS = 50;

const INITIAL_STATE = {
  query: '',
  results: [],
  total: 0,
  nextOffset: 0,
  status: 'idle',
  error: null,
};

export function useAlbumSearch() {
  const [state, setState] = useState(INITIAL_STATE);
  // El AbortController del pedido en curso, para cancelarlo si arranca otro.
  const controllerRef = useRef(null);

  // Al desmontar, cancelamos el pedido que haya quedado en vuelo.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const fetchPage = useCallback(async (query, offset) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const isFirstPage = offset === 0;
    setState((prev) =>
      isFirstPage
        ? { ...INITIAL_STATE, query, status: 'loading' }
        : { ...prev, status: 'loadingMore', error: null },
    );

    try {
      const { albums, total } = await searchAlbums(query, { offset, signal: controller.signal });
      setState((prev) => {
        // Agregamos sin duplicar (Spotify a veces repite un disco entre páginas) y descartamos
        // lo que no se parece a lo buscado (la búsqueda de Spotify siempre devuelve algo).
        const knownIds = new Set(prev.results.map((album) => album.id));
        const newAlbums = albums.filter((album) => !knownIds.has(album.id) && matchesQuery(album, query));
        return {
          ...prev,
          results: [...prev.results, ...newAlbums],
          total,
          // Contamos lo que pidió Spotify (no lo que quedó después de filtrar) para no repetir páginas.
          nextOffset: offset + albums.length,
          status: 'success',
        };
      });
    } catch (error) {
      if (error.name === 'AbortError') return; // la cancelamos nosotros: no es un error
      setState((prev) => ({ ...prev, status: 'error', error: error.message }));
    }
  }, []);

  const search = useCallback((query) => fetchPage(query.trim(), 0), [fetchPage]);

  const loadMore = useCallback(() => {
    fetchPage(state.query, state.nextOffset);
  }, [fetchPage, state.query, state.nextOffset]);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState(INITIAL_STATE);
  }, []);

  const hasMore = state.nextOffset > 0 && state.nextOffset < Math.min(state.total, MAX_RESULTS);

  return {
    query: state.query,
    results: state.results,
    total: state.total,
    status: state.status,
    error: state.error,
    hasMore,
    search,
    loadMore,
    reset,
  };
}
