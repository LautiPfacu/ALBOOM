// ★ Operaciones de la biblioteca en Cloud Firestore.
// Ruta de cada disco guardado: users/{uid}/library/{albumId}   (albumId = id de Spotify)
//
//   CONSULTAR  → subscribeToLibrary, subscribeToLibraryItem  (onSnapshot)
//   AGREGAR    → addToLibrary, addAlbumsToLibrary            (setDoc / writeBatch)
//   MODIFICAR  → saveListening (puntaje, estado, reseña y reseña pública en un lote)
//                updateRating, updateStatus, updateReview    (updateDoc)
//   ELIMINAR   → removeFromLibrary                           (writeBatch: disco + reseña pública)

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

export const STATUS = Object.freeze({ LISTENED: 'escuchado', PENDING: 'pendiente' });
export const REVIEW_MAX_LENGTH = 500;
const WRITE_TIMEOUT_MS = 10_000;

const libraryCollection = (uid) => collection(db, 'users', uid, 'library');
const libraryDoc = (uid, albumId) => doc(db, 'users', uid, 'library', albumId);
// Reseña pública: reviews/{albumId}_{uid} (una por persona y disco)
const reviewDoc = (albumId, uid) => doc(db, 'reviews', `${albumId}_${uid}`);

// 'estimate' evita fechas null mientras Firestore confirma una escritura recién hecha.
const fromSnapshot = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data({ serverTimestamps: 'estimate' }),
});

// ---------- CONSULTAR ----------

// Escucha toda la biblioteca en tiempo real, del más nuevo al más viejo.
// Devuelve la función para dejar de escuchar (usarla en el cleanup del useEffect).
export function subscribeToLibrary(uid, onData, onError) {
  const q = query(libraryCollection(uid), orderBy('addedAt', 'desc'));
  return onSnapshot(q, (snapshot) => onData(snapshot.docs.map(fromSnapshot)), onError);
}

// Escucha un solo disco. onData recibe null si no está en la biblioteca.
export function subscribeToLibraryItem(uid, albumId, onData, onError) {
  return onSnapshot(
    libraryDoc(uid, albumId),
    (snapshot) => onData(snapshot.exists() ? fromSnapshot(snapshot) : null),
    onError,
  );
}

// ---------- AGREGAR ----------

// isPublic: valor inicial de "Mostrar en la comunidad" (sale de los ajustes del perfil).
export async function addToLibrary(uid, album, status = STATUS.LISTENED, { isPublic = true } = {}) {
  assertValidStatus(status);
  await safeWrite(() => setDoc(libraryDoc(uid, album.id), newLibraryItem(album, status, isPublic)));
}

// Varios discos a la vez (primera vez, paso 2): todos como escuchados, en un solo lote.
export async function addAlbumsToLibrary(uid, albums, { isPublic = true } = {}) {
  const batch = writeBatch(db);
  for (const album of albums) {
    batch.set(libraryDoc(uid, album.id), newLibraryItem(album, STATUS.LISTENED, isPublic));
  }
  await safeWrite(() => batch.commit());
}

function newLibraryItem(album, status, isPublic) {
  return {
    name: album.name,
    artist: album.artist,
    artistId: album.artistId ?? null, // sirve para recomendar más discos del mismo artista
    cover: album.cover ?? null,
    year: album.year ?? null,
    spotifyUrl: album.spotifyUrl ?? null,
    status,
    rating: 0,
    review: '',
    // Fecha de escucha: se pone la primera vez que el disco queda como escuchado.
    listenedAt: status === STATUS.LISTENED ? serverTimestamp() : null,
    isPublic,
    addedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

// ---------- MODIFICAR ----------

export async function updateRating(uid, albumId, rating) {
  await updateItem(uid, albumId, { rating: normalizeRating(rating) });
}

export async function updateStatus(uid, albumId, status) {
  assertValidStatus(status);
  await updateItem(uid, albumId, { status });
}

export async function updateReview(uid, albumId, review) {
  await updateItem(uid, albumId, { review: review.trim().slice(0, REVIEW_MAX_LENGTH) });
}

function updateItem(uid, albumId, changes) {
  return safeWrite(() =>
    updateDoc(libraryDoc(uid, albumId), { ...changes, updatedAt: serverTimestamp() }),
  );
}

// Una reseña se publica si "Mostrar en la comunidad" está activo, el disco está escuchado y tiene puntaje.
export function isPublishable(item) {
  return Boolean(item?.isPublic) && item.status === STATUS.LISTENED && item.rating > 0;
}

// Guarda cambios de "Tu escucha" y mantiene la reseña pública al día, todo en un writeBatch:
// o se guardan las dos cosas, o ninguna.
//   changes: { rating?, status?, review?, isPublic? }
//   author:  { username, displayName, photoURL } (del perfil)
// → { published, wasPublished }
export async function saveListening(uid, item, changes, author) {
  const cleanChanges = { ...changes };
  if ('rating' in cleanChanges) cleanChanges.rating = normalizeRating(cleanChanges.rating);
  if ('review' in cleanChanges) cleanChanges.review = cleanChanges.review.trim().slice(0, REVIEW_MAX_LENGTH);
  if ('status' in cleanChanges) {
    assertValidStatus(cleanChanges.status);
    // La fecha de escucha se pone una sola vez y no se borra si vuelve a pendiente.
    if (cleanChanges.status === STATUS.LISTENED && !item.listenedAt) {
      cleanChanges.listenedAt = serverTimestamp();
    }
  }

  const next = { ...item, ...cleanChanges };
  const wasPublished = isPublishable(item);
  const published = isPublishable(next);

  const batch = writeBatch(db);
  batch.update(libraryDoc(uid, item.id), { ...cleanChanges, updatedAt: serverTimestamp() });

  const reviewRef = reviewDoc(item.id, uid);
  if (published) {
    batch.set(
      reviewRef,
      {
        albumId: item.id,
        uid,
        username: author?.username ?? '',
        displayName: author?.displayName ?? '',
        photoURL: author?.photoURL ?? null,
        rating: next.rating,
        text: next.review ?? '',
        album: { name: item.name, artist: item.artist, cover: item.cover ?? null, year: item.year ?? null },
        updatedAt: serverTimestamp(),
        // createdAt solo al publicarla por primera vez (con merge, las siguientes no lo pisan).
        ...(wasPublished ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true },
    );
  } else if (wasPublished) {
    batch.delete(reviewRef);
  }

  await safeWrite(() => batch.commit());
  return { published, wasPublished };
}

// ---------- ELIMINAR ----------

// Borra el disco y, si existía, su reseña pública.
export async function removeFromLibrary(uid, albumId) {
  const batch = writeBatch(db);
  batch.delete(libraryDoc(uid, albumId));
  batch.delete(reviewDoc(albumId, uid));
  await safeWrite(() => batch.commit());
}

// ---------- Ayudas ----------

// Redondea a medios puntos entre 0 y 5.
export function normalizeRating(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(5, Math.max(0, Math.round(number * 2) / 2));
}

function assertValidStatus(status) {
  if (!Object.values(STATUS).includes(status)) {
    throw new LibraryError('app/invalid-status', `Estado inválido: ${status}`);
  }
}

class LibraryError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// Sin conexión, Firestore deja la escritura en cola y la promesa nunca termina.
// Por eso cortamos antes si no hay internet, y ponemos un tiempo máximo de espera,
// para poder mostrar un error en pantalla en vez de un «Guardando…» infinito.
async function safeWrite(operation) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new LibraryError('app/offline', 'Sin conexión');
  }
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new LibraryError('app/timeout', 'Firestore no respondió')),
      WRITE_TIMEOUT_MS,
    );
  });
  try {
    return await Promise.race([operation(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

const LIBRARY_ERRORS = {
  'app/offline': 'Sin conexión. Revisá internet y probá de nuevo.',
  'app/timeout': 'Firestore tardó demasiado en responder. Revisá tu conexión.',
  'permission-denied': 'No tenés permiso para hacer esto. Volvé a iniciar sesión.',
  unavailable: 'Firestore no está disponible en este momento. Probá de nuevo.',
  'not-found': 'Este disco ya no está en tu biblioteca.',
};

export function libraryErrorMessage(error) {
  return LIBRARY_ERRORS[error?.code] ?? 'No pudimos guardar el cambio. Probá de nuevo.';
}
