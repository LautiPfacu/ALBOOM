// Spotify con la cuenta de cada persona (no la de la app).
//
// Flujo "Authorization Code con PKCE": el navegador pide permiso a Spotify sin usar el secret.
//   1. startSpotifyLogin: arma un "code verifier" al azar y manda a la persona a Spotify.
//   2. Spotify vuelve a /spotify/callback con un código.
//   3. finishSpotifyLogin: cambia el código por tokens y guarda el refresh token en
//      users/{uid}/private/spotify (solo lo lee el dueño).
//   4. syncSpotify: con un token fresco lee lo escuchado y los artistas más escuchados.
//
// Permisos (scopes): user-read-recently-played y user-top-read. Nada más.
// En modo desarrollo solo pueden conectar las cuentas agregadas en el dashboard de Spotify.

import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { publicProfileRef } from './publicProfile';
import { getSpotifyClientId } from './spotify';
import { AppError, safeWrite } from './writes';

const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_URL = 'https://api.spotify.com/v1';
const SCOPES = 'user-read-recently-played user-top-read';
// Guardamos el verifier solo durante el viaje a Spotify y vuelta (sessionStorage se borra al cerrar).
const VERIFIER_KEY = 'alboom:spotifyVerifier';
const STATE_KEY = 'alboom:spotifyState';
const RECENT_SIZE = 6;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const DEFAULT_SPOTIFY_SETTINGS = { useForRecommendations: true, showRecent: true, suggest: true };

const userRef = (uid) => doc(db, 'users', uid);
const privateRef = (uid) => doc(db, 'users', uid, 'private', 'spotify');

export const spotifyRedirectUri = () => `${window.location.origin}/spotify/callback`;

// ---------- Ayudas del flujo PKCE ----------

function randomString(length) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

// SHA-256 del verifier en base64url: es el "challenge" que se manda a Spotify.
async function challengeFor(verifier) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ---------- 1. Ir a Spotify ----------

export async function startSpotifyLogin() {
  const clientId = await getSpotifyClientId();
  const verifier = randomString(64);
  const state = randomString(16);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: spotifyRedirectUri(),
    code_challenge_method: 'S256',
    code_challenge: await challengeFor(verifier),
    scope: SCOPES,
    state,
  });
  window.location.assign(`${AUTH_URL}?${params}`);
}

// ---------- 2 y 3. Volver de Spotify ----------

async function requestToken(body) {
  let response;
  try {
    response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    });
  } catch (error) {
    throw new AppError('spotify/network', 'Sin conexión con Spotify.', { cause: error });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new AppError('spotify/token', data.error_description ?? 'Spotify rechazó la conexión.');
  return data;
}

// params: los de la URL de vuelta (?code=…&state=… o ?error=…)
export async function finishSpotifyLogin(uid, params) {
  if (params.get('error')) throw new AppError('spotify/denied');
  const savedState = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  if (!verifier || params.get('state') !== savedState) throw new AppError('spotify/state');

  const clientId = await getSpotifyClientId();
  const tokens = await requestToken({
    grant_type: 'authorization_code',
    code: params.get('code'),
    redirect_uri: spotifyRedirectUri(),
    client_id: clientId,
    code_verifier: verifier,
  });
  tokenCache = { uid, token: tokens.access_token, expiresAt: Date.now() + (tokens.expires_in - 60) * 1000 };

  // ¿Spotify deja usar esta cuenta? En modo desarrollo, /me da 403 si no está habilitada.
  const me = await spotifyGet('/me', tokens.access_token);

  const batch = writeBatch(db);
  batch.set(privateRef(uid), { refreshToken: tokens.refresh_token, scope: tokens.scope, updatedAt: serverTimestamp() });
  batch.update(userRef(uid), {
    spotify: { connected: true, displayName: me.display_name || me.id, lastSync: null, ...DEFAULT_SPOTIFY_SETTINGS },
  });
  await safeWrite(() => batch.commit());
}

// ---------- Tokens ----------

let tokenCache = null; // { uid, token, expiresAt } — en memoria, nunca en Firestore

async function getAccessToken(uid, refreshToken) {
  if (tokenCache?.uid === uid && Date.now() < tokenCache.expiresAt) return tokenCache.token;
  const clientId = await getSpotifyClientId();
  const tokens = await requestToken({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: clientId });
  tokenCache = { uid, token: tokens.access_token, expiresAt: Date.now() + (tokens.expires_in - 60) * 1000 };
  // Con PKCE, Spotify puede devolver un refresh token nuevo: lo guardamos.
  if (tokens.refresh_token && tokens.refresh_token !== refreshToken) {
    await setDoc(privateRef(uid), { refreshToken: tokens.refresh_token, updatedAt: serverTimestamp() }, { merge: true });
  }
  return tokens.access_token;
}

async function spotifyGet(path, token) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch (error) {
    throw new AppError('spotify/network', 'Sin conexión con Spotify.', { cause: error });
  }
  if (response.status === 403) throw new AppError('spotify/not-allowed');
  if (response.status === 401) throw new AppError('spotify/expired');
  if (!response.ok) throw new AppError('spotify/api');
  return response.json();
}

// ---------- 4. Leer lo que escuchás ----------

const toAlbum = (album) => ({
  albumId: album.id,
  id: album.id,
  name: album.name,
  artist: (album.artists ?? []).map((a) => a.name).join(', '),
  artistId: album.artists?.[0]?.id ?? null,
  cover: album.images?.[0]?.url ?? null,
  year: Number.parseInt((album.release_date ?? '').slice(0, 4), 10) || null,
  spotifyUrl: album.external_urls?.spotify ?? null,
});

// Lee las últimas 50 reproducciones y los artistas más escuchados, y guarda:
//   profiles/{uid}.recent        → últimos 6 discos únicos (público, si showRecent está activo)
//   private/spotify.suggestions  → discos que escuchaste esta semana (con cuántas canciones)
//   private/spotify.topArtists   → para las recomendaciones
export async function syncSpotify(uid, settings, refreshToken) {
  const token = await getAccessToken(uid, refreshToken);
  const [played, top] = await Promise.all([
    spotifyGet('/me/player/recently-played?limit=50', token),
    spotifyGet('/me/top/artists?limit=5&time_range=short_term', token),
  ]);

  // Agrupamos las canciones por disco (vienen de la más nueva a la más vieja).
  const albums = new Map();
  for (const item of played.items ?? []) {
    const album = item.track?.album;
    if (!album) continue;
    const current = albums.get(album.id) ?? { ...toAlbum(album), playedAt: item.played_at, tracksThisWeek: 0 };
    if (Date.now() - new Date(item.played_at).getTime() < WEEK_MS) current.tracksThisWeek += 1;
    albums.set(album.id, current);
  }
  const list = [...albums.values()];

  const recent = list.slice(0, RECENT_SIZE).map(({ albumId, name, artist, cover, playedAt }) => ({
    albumId,
    name,
    artist,
    cover,
    playedAt,
  }));
  const suggestions = list.filter((album) => album.tracksThisWeek > 0);
  const topArtists = (top.items ?? []).map((artist) => ({ id: artist.id, name: artist.name }));

  const batch = writeBatch(db);
  batch.set(privateRef(uid), { suggestions, topArtists, updatedAt: serverTimestamp() }, { merge: true });
  batch.update(userRef(uid), { 'spotify.lastSync': serverTimestamp() });
  batch.update(publicProfileRef(uid), { recent: settings.showRecent ? recent : [] });
  await safeWrite(() => batch.commit());
}

// Datos privados de Spotify en tiempo real (sugerencias, artistas, refresh token).
export function subscribeToSpotifyPrivate(uid, onData, onError) {
  return onSnapshot(privateRef(uid), (s) => onData(s.exists() ? s.data() : null), onError);
}

// ---------- Ajustes y desconectar ----------

// settings: { useForRecommendations, showRecent, suggest }
export async function updateSpotifySettings(uid, spotify, settings) {
  const batch = writeBatch(db);
  batch.update(userRef(uid), { spotify: { ...spotify, ...settings } });
  if (!settings.showRecent) batch.update(publicProfileRef(uid), { recent: [] });
  await safeWrite(() => batch.commit());
}

export async function disconnectSpotify(uid) {
  tokenCache = null;
  const batch = writeBatch(db);
  batch.delete(privateRef(uid));
  batch.update(userRef(uid), { spotify: { connected: false } });
  batch.update(publicProfileRef(uid), { recent: [] });
  await safeWrite(() => batch.commit());
}

// Para eliminar la cuenta.
export function deleteSpotifyPrivate(uid) {
  return deleteDoc(privateRef(uid));
}

const SPOTIFY_ERRORS = {
  'spotify/denied': 'Cancelaste la conexión con Spotify.',
  'spotify/state': 'La conexión con Spotify se interrumpió. Probá de nuevo.',
  'spotify/not-allowed':
    'Tu cuenta todavía no está habilitada para conectar Spotify. (En modo desarrollo, hay que agregarla en el dashboard de Spotify.)',
  'spotify/expired': 'Spotify cerró la conexión. Volvé a conectar tu cuenta.',
  'spotify/token': 'Spotify rechazó la conexión. Probá de nuevo.',
  'spotify/network': 'Sin conexión con Spotify. Revisá internet.',
  'spotify/api': 'Spotify no respondió. Probá de nuevo en un rato.',
};

export function spotifyErrorMessage(error) {
  return SPOTIFY_ERRORS[error?.code] ?? 'No pudimos conectar con Spotify. Probá de nuevo.';
}

