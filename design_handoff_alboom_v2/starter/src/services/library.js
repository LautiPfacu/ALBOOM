// ★ Operaciones de la biblioteca en Cloud Firestore.
// Ruta de cada disco guardado: users/{uid}/library/{albumId}   (albumId = id de Spotify)
//
//   CONSULTAR  → subscribeToLibrary, subscribeToLibraryItem  (onSnapshot)
//   AGREGAR    → addToLibrary                                (setDoc)
//   MODIFICAR  → updateRating, updateStatus, updateReview    (updateDoc)
//   ELIMINAR   → removeFromLibrary                           (deleteDoc)

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

export const STATUS = Object.freeze({ LISTENED: 'escuchado', PENDING: 'pendiente' });
export const REVIEW_MAX_LENGTH = 500;
const WRITE_TIMEOUT_MS = 10_000;

const libraryCollection = (uid) => collection(db, 'users', uid, 'library');
const libraryDoc = (uid, albumId) => doc(db, 'users', uid, 'library', albumId);

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

export async function addToLibrary(uid, album, status = STATUS.LISTENED) {
  assertValidStatus(status);
  await safeWrite(() =>
    setDoc(libraryDoc(uid, album.id), {
      name: album.name,
      artist: album.artist,
      cover: album.cover ?? null,
      year: album.year ?? null,
      spotifyUrl: album.spotifyUrl ?? null,
      status,
      rating: 0,
      review: '',
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
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

// ---------- ELIMINAR ----------

export async function removeFromLibrary(uid, albumId) {
  await safeWrite(() => deleteDoc(libraryDoc(uid, albumId)));
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
