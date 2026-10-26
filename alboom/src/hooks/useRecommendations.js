// Recomendaciones de "Para vos" (services/recommendations.js).
//   const { picks, loading } = useRecommendations(10);
//
// Se recalculan cuando cambian tus géneros o los discos que puntuaste alto.
// Lo que guardás en la biblioteca o marcás "No me interesa" desaparece al instante,
// sin volver a pedir nada (se filtra a partir de los datos).

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { getRecommendations } from '../services/recommendations';
import { useDismissed } from './useDismissed';
import { useSpotify } from './useSpotify';

export function useRecommendations(size = 10) {
  const { user, profile } = useAuth();
  const { items, loading: libraryLoading, savedIds } = useLibrary();
  const dismissed = useDismissed();
  const { settings: spotifySettings, topArtists } = useSpotify();
  // Solo si conectaste Spotify y dejaste activo "Recomendaciones con lo que escucho".
  const spotifyArtists = spotifySettings.useForRecommendations ? topArtists : [];

  // Clave de lo que influye en las recomendaciones: géneros + discos puntuados con 4 o más.
  const genres = profile?.genres ?? [];
  const likedKey = items
    .filter((item) => item.rating >= 4)
    .map((item) => `${item.id}:${item.rating}`)
    .join(',');
  const spotifyKey = spotifyArtists.map((artist) => artist.id).join(',');
  const inputKey = libraryLoading ? null : `${user.uid}|${genres.join(',')}|${likedKey}|${spotifyKey}`;

  // "Ajustar estado cuando cambia algo" (patrón de la doc de React): guardamos los datos de entrada
  // solo cuando cambia la clave, así el efecto no se vuelve a ejecutar con cada cambio de la biblioteca.
  const [input, setInput] = useState({ key: null, library: [], genres: [], spotifyArtists: [] });
  if (inputKey !== input.key) setInput({ key: inputKey, library: items, genres, spotifyArtists });

  const [state, setState] = useState({ key: null, picks: [], error: null });

  useEffect(() => {
    if (!input.key) return undefined;
    const controller = new AbortController();
    getRecommendations({
      uid: user.uid,
      library: input.library,
      genres: input.genres,
      spotifyArtists: input.spotifyArtists,
      size,
      signal: controller.signal,
    })
      .then((picks) => setState({ key: input.key, picks, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState({ key: input.key, picks: [], error: 'No pudimos armar tus recomendaciones.' });
        }
      });
    return () => controller.abort();
  }, [input, user.uid, size]);

  const loading = !input.key || state.key !== input.key;

  // Sacamos lo que ya guardaste o descartaste desde que se calcularon.
  const picks = useMemo(
    () => (loading ? [] : state.picks.filter((pick) => !savedIds.has(pick.album.id) && !dismissed.has(pick.album.id))),
    [loading, state.picks, savedIds, dismissed],
  );

  return { picks, loading, error: loading ? null : state.error };
}
