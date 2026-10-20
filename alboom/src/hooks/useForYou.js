// "Para vos": discos de los géneros de la persona (hasta 2 géneros), mezclados y sin repetir.
//   const { albums, loading } = useForYou(['rock-nacional', 'pop'], 5);

import { useEffect, useMemo, useState } from 'react';
import { getGenre } from '../data/genres';
import { searchGenreAlbums } from '../services/spotify';

export function useForYou(genreIds, limit = 5) {
  const spotifyGenres = useMemo(
    () => (genreIds ?? []).slice(0, 2).map((id) => getGenre(id)?.spotify).filter(Boolean),
    [genreIds],
  );
  const key = spotifyGenres.join('|');
  const [state, setState] = useState({ key: null, albums: [] });

  useEffect(() => {
    if (!key) return undefined;
    const controller = new AbortController();
    Promise.all(key.split('|').map((genre) => searchGenreAlbums(genre, { signal: controller.signal })))
      .then((pages) => {
        // Intercalamos: uno de cada género, así la lista no queda dominada por uno solo.
        const mixed = [];
        const seen = new Set();
        const longest = Math.max(...pages.map((page) => page.albums.length));
        for (let i = 0; i < longest; i += 1) {
          for (const page of pages) {
            const album = page.albums[i];
            if (album && !seen.has(album.id)) {
              seen.add(album.id);
              mixed.push(album);
            }
          }
        }
        setState({ key, albums: mixed.slice(0, limit) });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ key, albums: [] });
      });
    return () => controller.abort();
  }, [key, limit]);

  return { albums: state.key === key ? state.albums : [], loading: Boolean(key) && state.key !== key };
}
