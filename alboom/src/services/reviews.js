// Reseñas públicas de la comunidad: reviews/{albumId}_{uid}
// Se escriben desde library.js (saveListening) junto con la biblioteca. Acá solo se leen.
//
// Nota para más adelante: el promedio y la distribución se calculan en el navegador leyendo
// las reseñas de cada disco. Alcanza para el tamaño del TP; con muchos usuarios convendría
// mantener esos números en el documento del disco con una Cloud Function.

import { collection, getDocs, onSnapshot, query, Timestamp, where } from 'firebase/firestore';
import { db } from '../firebase';

const reviewsCollection = collection(db, 'reviews');

const fromSnapshot = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data({ serverTimestamps: 'estimate' }),
});

// CONSULTAR en tiempo real las reseñas de un disco.
export function subscribeToAlbumReviews(albumId, onData, onError) {
  const q = query(reviewsCollection, where('albumId', '==', albumId));
  return onSnapshot(q, (snapshot) => onData(snapshot.docs.map(fromSnapshot)), onError);
}

// Promedio y cantidad de reseñas de varios discos a la vez.
// Firestore acepta hasta 30 valores en un "in", así que pedimos de a 30.
// → Map(albumId → { average, count })
export async function getStatsForAlbums(albumIds) {
  const unique = [...new Set(albumIds)];
  const chunks = [];
  for (let i = 0; i < unique.length; i += 30) chunks.push(unique.slice(i, i + 30));

  const snapshots = await Promise.all(
    chunks.map((chunk) => getDocs(query(reviewsCollection, where('albumId', 'in', chunk)))),
  );
  const reviews = snapshots.flatMap((snapshot) => snapshot.docs.map((d) => d.data()));
  return summarizeByAlbum(reviews);
}

// Tendencias: los discos con más reseñas nuevas en los últimos 7 días.
// → [{ albumId, album, count, average }] ordenado de mayor a menor
export async function getWeeklyTrends(limit = 5) {
  const weekAgo = Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const snapshot = await getDocs(query(reviewsCollection, where('createdAt', '>=', weekAgo)));
  const reviews = snapshot.docs.map((d) => d.data());

  const stats = summarizeByAlbum(reviews);
  const albumById = new Map(reviews.map((review) => [review.albumId, review.album]));
  return [...stats.entries()]
    .map(([albumId, { average, count }]) => ({ albumId, album: albumById.get(albumId), average, count }))
    .sort((a, b) => b.count - a.count || b.average - a.average)
    .slice(0, limit);
}

// Recomendaciones de la comunidad: "a gente con tu gusto le encantó…".
//  1. Buscamos quiénes puntuaron con 4 o más los mismos discos que vos.
//  2. Juntamos los otros discos que esas personas puntuaron con 4 o más.
//  3. Los ordenamos por cuántas de esas personas coinciden y por su promedio.
// Si todavía no hay coincidencias, usamos los discos mejor puntuados de ALBOOM.
// → [{ album: { id, name, artist, cover, year }, average, count, reason }]
export async function getCommunityPicks(uid, likedAlbumIds) {
  const GOOD = 4;
  let peerReviews = [];

  if (likedAlbumIds.length > 0) {
    const sameAlbums = await getDocs(query(reviewsCollection, where('albumId', 'in', likedAlbumIds.slice(0, 30))));
    const peers = [
      ...new Set(
        sameAlbums.docs.map((d) => d.data()).filter((r) => r.uid !== uid && r.rating >= GOOD).map((r) => r.uid),
      ),
    ];
    if (peers.length > 0) {
      const snapshot = await getDocs(query(reviewsCollection, where('uid', 'in', peers.slice(0, 30))));
      peerReviews = snapshot.docs.map((d) => d.data());
    }
  }

  const fromPeers = peerReviews.length > 0;
  let candidates = peerReviews;
  if (!fromPeers) {
    // Plan B: lo mejor puntuado de toda la comunidad (desigualdad sobre un solo campo: no pide índice).
    const snapshot = await getDocs(query(reviewsCollection, where('rating', '>=', GOOD)));
    candidates = snapshot.docs.map((d) => d.data());
  }

  const totals = new Map();
  for (const review of candidates) {
    if (review.rating < GOOD || review.uid === uid) continue;
    const current = totals.get(review.albumId) ?? { album: review.album, sum: 0, count: 0 };
    totals.set(review.albumId, { ...current, sum: current.sum + review.rating, count: current.count + 1 });
  }

  return [...totals.entries()]
    .map(([albumId, { album, sum, count }]) => ({
      album: { id: albumId, ...album },
      average: sum / count,
      count,
      reason: fromPeers ? 'A gente con tu gusto le encantó' : 'Muy bien puntuado en ALBOOM',
    }))
    .sort((a, b) => b.count - a.count || b.average - a.average);
}

// Agrupa reseñas por disco: Map(albumId → { average, count })
function summarizeByAlbum(reviews) {
  const totals = new Map();
  for (const review of reviews) {
    const current = totals.get(review.albumId) ?? { sum: 0, count: 0 };
    totals.set(review.albumId, { sum: current.sum + review.rating, count: current.count + 1 });
  }
  return new Map(
    [...totals.entries()].map(([albumId, { sum, count }]) => [albumId, { average: sum / count, count }]),
  );
}

// Promedio, cantidad y distribución en 10 barras (½ a 5) de una lista de reseñas.
export function summarizeReviews(reviews) {
  const distribution = Array(10).fill(0);
  let sum = 0;
  for (const review of reviews) {
    sum += review.rating;
    const index = Math.round(review.rating * 2) - 1; // 0,5 → 0 … 5 → 9
    if (index >= 0 && index < 10) distribution[index] += 1;
  }
  const count = reviews.length;
  return { count, average: count ? sum / count : 0, distribution };
}
