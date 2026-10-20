// Función serverless de Vercel: GET /api/spotify
// Guarda la clave secreta de Spotify del lado del servidor. El navegador nunca la ve.
//
//   /api/spotify?type=search&q=cerati&offset=0   → { albums: [...], total }
//   /api/spotify?type=album&id=SPOTIFY_ALBUM_ID  → { album: {..., tracks: [...] } }
//
// En desarrollo la sirve vite.config.js con este mismo archivo (alcanza con `npm run dev`).

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_URL = 'https://api.spotify.com/v1';
const SEARCH_LIMIT = 10; // máximo permitido en modo desarrollo de Spotify (feb. 2026)
const MARKET = 'AR';

let cachedToken = null;
let tokenExpiresAt = 0;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Flujo Client Credentials: pide un token con Client ID + Client Secret y lo reutiliza hasta que vence.
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new HttpError(500, 'Faltan SPOTIFY_CLIENT_ID o SPOTIFY_CLIENT_SECRET en las variables de entorno.');
  }

  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new HttpError(502, 'Spotify rechazó las credenciales. Revisá el Client ID y el Client Secret.');
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000; // renovamos un minuto antes
  return cachedToken;
}

async function spotifyGet(path) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    cachedToken = null; // token vencido o revocado: el próximo pedido pide uno nuevo
    throw new HttpError(502, 'Spotify no aceptó el token. Probá de nuevo.');
  }
  if (response.status === 404) throw new HttpError(404, 'No encontramos ese disco en Spotify.');
  if (response.status === 429) throw new HttpError(429, 'Hiciste muchas búsquedas seguidas. Esperá unos segundos.');
  if (!response.ok) throw new HttpError(502, 'Spotify no respondió. Probá de nuevo en un rato.');

  return response.json();
}

// Achicamos las respuestas de Spotify a lo que ALBOOM usa.
function toAlbumSummary(album) {
  return {
    id: album.id,
    name: album.name,
    artist: (album.artists ?? []).map((artist) => artist.name).join(', '),
    year: Number.parseInt((album.release_date ?? '').slice(0, 4), 10) || null,
    cover: album.images?.[0]?.url ?? null,
    totalTracks: album.total_tracks ?? null,
    spotifyUrl: album.external_urls?.spotify ?? null,
  };
}

function toAlbumDetail(album) {
  const tracks = (album.tracks?.items ?? []).map((track) => ({
    id: track.id,
    number: track.track_number,
    disc: track.disc_number,
    name: track.name,
    durationMs: track.duration_ms,
  }));
  return {
    ...toAlbumSummary(album),
    tracks,
    durationMs: tracks.reduce((total, track) => total + (track.durationMs ?? 0), 0),
  };
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Método no permitido.' });

  const { searchParams } = new URL(req.url, 'http://localhost');
  const type = searchParams.get('type');

  try {
    if (type === 'search') {
      const query = (searchParams.get('q') ?? '').trim();
      if (query.length < 2) return sendJson(res, 400, { error: 'Escribí al menos 2 letras.' });

      const offset = Math.max(0, Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0);
      const params = new URLSearchParams({
        q: query,
        type: 'album',
        limit: String(SEARCH_LIMIT),
        offset: String(offset),
        market: MARKET,
      });
      const data = await spotifyGet(`/search?${params}`);
      const albums = (data.albums?.items ?? []).filter(Boolean).map(toAlbumSummary);
      return sendJson(res, 200, { albums, total: data.albums?.total ?? albums.length });
    }

    if (type === 'album') {
      const id = searchParams.get('id') ?? '';
      if (!/^[A-Za-z0-9]{22}$/.test(id)) return sendJson(res, 400, { error: 'El ID del disco no es válido.' });

      const data = await spotifyGet(`/albums/${id}?market=${MARKET}`);
      return sendJson(res, 200, { album: toAlbumDetail(data) });
    }

    return sendJson(res, 400, { error: 'Falta el parámetro type (search o album).' });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    if (status === 500) console.error(error);
    return sendJson(res, status, { error: error.message || 'Error inesperado.' });
  }
}
