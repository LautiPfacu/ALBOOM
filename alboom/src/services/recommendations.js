// "Para vos": recomendaciones que mezclan tres fuentes con cupos fijos.
//
//   Afinidad        ~40 %  Más discos de los artistas que puntuaste con 4 o más.
//   Comunidad       ~20 %  Lo que puntuó alto la gente de ALBOOM que coincide con tus puntajes.
//   Descubrimiento  ~40 %  Discos poco escuchados en Spotify (tag:hipster) de tus géneros.
//
// Los cupos existen para que lo conocido nunca ocupe todos los lugares: la idea de ALBOOM
// es también conocer música nueva, poco conocida y emergente.
// Spotify ya no da popularidad ni artistas relacionados a apps nuevas: por eso usamos estas fuentes.

import { getGenre, ONBOARDING_GENRES } from '../data/genres';
import { getCommunityPicks } from './reviews';
import { discoverAlbums, getAlbum, getArtist, searchGenreAlbums } from './spotify';

const QUOTAS = { affinity: 0.4, community: 0.2, discovery: 0.4 };
const GOOD_RATING = 4;
const MAX_ARTISTS = 3;
const PER_ARTIST = 3;

// Mezcla al azar (Fisher-Yates), para que cada vez aparezcan cosas distintas.
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Si una fuente falla (por ejemplo, Spotify no responde), seguimos con las otras.
// Solo dejamos pasar la cancelación, para no actualizar una pantalla que ya no está.
const safely = (promise) =>
  promise.catch((error) => {
    if (error.name === 'AbortError') throw error;
    return [];
  });

// Nombre corto y en español del género ("indie-rock" → "Indie").
function genreLabel(id) {
  return ONBOARDING_GENRES.find((genre) => genre.id === id)?.label ?? getGenre(id)?.nombre ?? id;
}

// ---------- Afinidad ----------

async function affinityPicks(liked, genres, signal) {
  if (liked.length === 0) {
    // Sin puntajes todavía: discos de tus géneros.
    const pages = await Promise.all(
      genres.slice(0, 2).map(async (id) => {
        const spotify = getGenre(id)?.spotify;
        if (!spotify) return [];
        const { albums } = await searchGenreAlbums(spotify, { signal });
        return albums.map((album) => ({ album, reason: `Por tu gusto por el ${genreLabel(id).toLowerCase()}` }));
      }),
    );
    return shuffle(pages.flat());
  }

  // Un disco "semilla" por artista (el mejor puntuado de cada uno), hasta 3 artistas.
  const seeds = [];
  const seenArtists = new Set();
  for (const item of liked) {
    const key = item.artistId ?? item.artist;
    if (seenArtists.has(key)) continue;
    seenArtists.add(key);
    seeds.push(item);
    if (seeds.length === MAX_ARTISTS) break;
  }

  const groups = await Promise.all(
    seeds.map(async (seed) => {
      // Los discos guardados antes de esta versión no tienen artistId: lo buscamos en Spotify.
      const artistId = seed.artistId ?? (await getAlbum(seed.id, { signal })).artistId;
      if (!artistId) return [];
      const { albums } = await getArtist(artistId, { signal });
      return shuffle(albums)
        .slice(0, PER_ARTIST)
        .map((album) => ({ album, reason: `Porque te gustó ${seed.name}` }));
    }),
  );
  // Intercalamos artistas: uno de cada uno, así no se amontona uno solo.
  const mixed = [];
  for (let i = 0; i < PER_ARTIST; i += 1) groups.forEach((group) => group[i] && mixed.push(group[i]));
  return mixed;
}

// ---------- Descubrimiento ----------

async function discoveryPicks(genres, signal) {
  const terms = (genres.length > 0 ? genres : ['rock-nacional', 'indie-rock', 'electro']).slice(0, 3);
  const pages = await Promise.all(
    terms.map(async (id) => {
      // Un offset al azar para que no aparezcan siempre los mismos.
      const offset = [0, 20, 40][Math.floor(Math.random() * 3)];
      // Para buscar usamos el nombre completo del género ("Indie rock"), que da resultados más precisos.
      const albums = await discoverAlbums(getGenre(id)?.nombre ?? genreLabel(id), { offset, signal });
      return albums.map((album) => ({ album, reason: `Joya escondida · ${genreLabel(id)}` }));
    }),
  );
  // Primero los lanzamientos de los últimos 3 años (artistas emergentes); dentro de cada grupo, al azar.
  const recentFrom = new Date().getFullYear() - 3;
  const isRecent = (pick) => ((pick.album.year ?? 0) >= recentFrom ? 1 : 0);
  return shuffle(pages.flat()).sort((a, b) => isRecent(b) - isRecent(a));
}

// ---------- Mezcla con cupos ----------

// sources: { affinity: [...], community: [...], discovery: [...] }
function mixWithQuotas(sources, size, exclude) {
  const used = new Set(exclude);
  const take = (list, count) => {
    const picked = [];
    for (const pick of list) {
      if (picked.length === count) break;
      if (used.has(pick.album.id)) continue;
      used.add(pick.album.id);
      picked.push(pick);
    }
    return picked;
  };

  const affinityCount = Math.round(size * QUOTAS.affinity);
  const communityCount = Math.round(size * QUOTAS.community);
  const discoveryCount = size - affinityCount - communityCount;

  const affinity = take(sources.affinity, affinityCount);
  const community = take(sources.community, communityCount);
  const discovery = take(sources.discovery, discoveryCount);

  // Si una fuente no alcanzó su cupo, se completa primero con descubrimiento (para no
  // terminar mostrando solo lo conocido) y después con afinidad y comunidad.
  let missing = size - affinity.length - community.length - discovery.length;
  for (const [list, target] of [
    [sources.discovery, discovery],
    [sources.affinity, affinity],
    [sources.community, community],
  ]) {
    if (missing <= 0) break;
    const extra = take(list, missing);
    target.push(...extra);
    missing -= extra.length;
  }

  // Intercalado: afinidad, descubrimiento, comunidad, afinidad, descubrimiento…
  const result = [];
  const queues = [affinity, discovery, community];
  while (queues.some((queue) => queue.length > 0)) {
    queues.forEach((queue) => queue.length > 0 && result.push(queue.shift()));
  }
  return result;
}

// ---------- Todo junto ----------

// library: los discos de la biblioteca · genres: ids de generos.json · size: cuántas recomendaciones
// → [{ album, reason, source }]
export async function getRecommendations({ uid, library, genres, size = 10, signal }) {
  const liked = library
    .filter((item) => item.rating >= GOOD_RATING)
    .sort((a, b) => b.rating - a.rating);
  const exclude = library.map((item) => item.id);

  const [affinity, community, discovery] = await Promise.all([
    safely(affinityPicks(liked, genres, signal)),
    safely(getCommunityPicks(uid, liked.map((item) => item.id))),
    safely(discoveryPicks(genres, signal)),
  ]);

  const tag = (list, source) => list.map((pick) => ({ ...pick, source }));
  return mixWithQuotas(
    {
      affinity: tag(affinity, 'affinity'),
      community: tag(community, 'community'),
      discovery: tag(discovery, 'discovery'),
    },
    size,
    exclude,
  );
}
