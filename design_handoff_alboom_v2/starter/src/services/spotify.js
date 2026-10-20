// Cliente de nuestra función /api/spotify (api/spotify.js).
// El navegador nunca habla directo con Spotify ni conoce la clave secreta.

const ENDPOINT = '/api/spotify';
export const SEARCH_PAGE_SIZE = 10;

async function request(params, { signal } = {}) {
  let response;
  try {
    response = await fetch(`${ENDPOINT}?${new URLSearchParams(params)}`, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error; // búsqueda cancelada a propósito: no es un error para mostrar
    throw new Error('Sin conexión. Revisá internet y probá de nuevo.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error(data?.error || 'No pudimos consultar Spotify. Probá de nuevo.');
  }
  return data;
}

// → { albums: [{ id, name, artist, year, cover, totalTracks, spotifyUrl }], total }
export async function searchAlbums(query, { offset = 0, signal } = {}) {
  const data = await request({ type: 'search', q: query.trim(), offset: String(offset) }, { signal });
  return { albums: data.albums, total: data.total };
}

// → { id, name, artist, year, cover, totalTracks, spotifyUrl, durationMs, tracks: [{ id, number, disc, name, durationMs }] }
export async function getAlbum(id, { signal } = {}) {
  const data = await request({ type: 'album', id }, { signal });
  return data.album;
}

// 287000 → "4:47"
export function formatTrackDuration(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// 3066000 → "51 min"
export function formatAlbumDuration(ms) {
  return `${Math.round(ms / 60000)} min`;
}
