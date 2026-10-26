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
    throw new Error('Sin conexión. Revisá internet y probá de nuevo.', { cause: error });
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error(data?.error || 'No pudimos consultar Spotify. Probá de nuevo.');
  }
  return data;
}

// Caché en memoria de 10 minutos: volver a una pantalla no repite el pedido a Spotify.
const CACHE_MS = 10 * 60 * 1000;
const cache = new Map();

async function cachedRequest(params, options) {
  const key = new URLSearchParams(params).toString();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < CACHE_MS) return hit.data;
  const data = await request(params, options);
  cache.set(key, { time: Date.now(), data });
  return data;
}

// → { albums: [{ id, name, artist, artistId, year, cover, totalTracks, spotifyUrl }], total }
export async function searchAlbums(query, { offset = 0, signal } = {}) {
  const data = await cachedRequest({ type: 'search', q: query.trim(), offset: String(offset) }, { signal });
  return { albums: data.albums, total: data.total };
}

// → { id, name, artist, year, cover, totalTracks, spotifyUrl, durationMs, tracks: [{ id, number, disc, name, durationMs }] }
export async function getAlbum(id, { signal } = {}) {
  const data = await cachedRequest({ type: 'album', id }, { signal });
  return data.album;
}

// Discos de un género (valor "spotify" de generos.json), opcionalmente de una década.
// → { albums, nextOffset, hasMore }
export async function searchGenreAlbums(genre, { from, to, offset = 0, signal } = {}) {
  const params = { type: 'genre', genre, offset: String(offset) };
  if (from && to) Object.assign(params, { from: String(from), to: String(to) });
  return cachedRequest(params, { signal });
}

// → { artist: { id, name, image, genres }, albums: [...] }
export async function getArtist(id, { signal } = {}) {
  return cachedRequest({ type: 'artist', id }, { signal });
}

// Client ID público de la app de Spotify (para conectar la cuenta de cada persona).
export async function getSpotifyClientId() {
  const data = await cachedRequest({ type: 'config' });
  return data.clientId;
}

// Discos poco escuchados relacionados con un término (por ejemplo, un género).
// → [{ id, name, artist, artistId, year, cover, totalTracks, spotifyUrl }]
export async function discoverAlbums(term, { offset = 0, signal } = {}) {
  const data = await cachedRequest({ type: 'discover', q: term, offset: String(offset) }, { signal });
  return data.albums;
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
