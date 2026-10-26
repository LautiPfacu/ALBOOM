// Perfil PÚBLICO de cada persona: profiles/{uid}
// Lo puede leer cualquiera con sesión. Tiene solo datos que se pueden mostrar:
//   displayName, username, searchName, photoURL, bio, genres, top5, recent,
//   followersCount, followingCount, createdAt
// El perfil privado (users/{uid}: email, ajustes, Spotify…) sigue siendo solo del dueño.

import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { normalizeText } from '../utils/text';
import { chunk, safeWrite } from './writes';

export const BIO_MAX_LENGTH = 160;
export const TOP5_SIZE = 5;

export const publicProfileRef = (uid) => doc(db, 'profiles', uid);
const profilesCollection = collection(db, 'profiles');

const fromSnapshot = (snapshot) => ({ uid: snapshot.id, ...snapshot.data({ serverTimestamps: 'estimate' }) });

// Un disco reducido a lo que se guarda en el Top 5 y en los posteos.
export const albumSummary = (album) => ({
  albumId: album.albumId ?? album.id,
  name: album.name,
  artist: album.artist,
  cover: album.cover ?? null,
  year: album.year ?? null,
});

// ---------- Mantener la copia pública al día ----------

// Campos del perfil privado que también son públicos.
export function publicFieldsFrom(profile, photoURL) {
  const displayName = profile?.displayName ?? '';
  return {
    displayName,
    username: profile?.username ?? '',
    searchName: normalizeText(displayName), // para buscar por nombre sin tildes
    photoURL: photoURL ?? null,
    genres: profile?.genres ?? [],
  };
}

// ¿La copia pública ya tiene estos mismos datos? (para no escribir de más)
export function isPublicProfileInSync(publicProfile, fields) {
  if (!publicProfile) return false;
  return (
    publicProfile.displayName === fields.displayName &&
    publicProfile.username === fields.username &&
    publicProfile.photoURL === fields.photoURL &&
    (publicProfile.genres ?? []).join(',') === fields.genres.join(',')
  );
}

// Crea el perfil público si no existe (con contadores en 0) o actualiza sus datos.
export async function syncPublicProfile(uid, fields, exists) {
  if (exists) {
    await safeWrite(() => updateDoc(publicProfileRef(uid), fields));
  } else {
    await safeWrite(() =>
      setDoc(publicProfileRef(uid), {
        ...fields,
        bio: '',
        top5: [],
        recent: [],
        followersCount: 0,
        followingCount: 0,
        createdAt: serverTimestamp(),
      }),
    );
  }
}

// ---------- CONSULTAR ----------

// Un perfil en tiempo real. onData recibe null si no existe.
export function subscribeToPublicProfile(uid, onData, onError) {
  return onSnapshot(
    publicProfileRef(uid),
    (snapshot) => onData(snapshot.exists() ? fromSnapshot(snapshot) : null),
    onError,
  );
}

// "@lucia.vinilos" → uid (con la reserva usernames/{username})
export async function getUidByUsername(username) {
  const snapshot = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  return snapshot.exists() ? snapshot.data().uid : null;
}

// Varios perfiles por uid (de a 30, el máximo de un filtro "in"). → Map(uid → perfil)
export async function getProfiles(uids) {
  const unique = [...new Set(uids)].filter(Boolean);
  const snapshots = await Promise.all(
    chunk(unique).map((part) => getDocs(query(profilesCollection, where(documentId(), 'in', part)))),
  );
  return new Map(snapshots.flatMap((s) => s.docs).map((d) => [d.id, fromSnapshot(d)]));
}

// Buscar personas por @usuario o por nombre (empieza con…, sin tildes).
export async function searchPeople(text) {
  const term = normalizeText(text.trim().replace(/^@/, ''));
  if (term.length < 2) return [];
  const end = `${term}`; // "" es el último carácter: arma el rango "empieza con"
  const [byUsername, byName] = await Promise.all([
    getDocs(query(profilesCollection, where('username', '>=', term), where('username', '<', end), limit(10))),
    getDocs(query(profilesCollection, where('searchName', '>=', term), where('searchName', '<', end), limit(10))),
  ]);
  const found = new Map();
  [...byUsername.docs, ...byName.docs].forEach((d) => found.set(d.id, fromSnapshot(d)));
  return [...found.values()];
}

// Las personas que más gente sigue ("Referentes").
export async function getReferents(max = 5) {
  const snapshot = await getDocs(query(profilesCollection, orderBy('followersCount', 'desc'), limit(max)));
  return snapshot.docs.map(fromSnapshot).filter((p) => p.followersCount > 0);
}

// Perfiles recientes, para armar sugerencias de gente con gustos parecidos.
export async function getRecentProfiles(max = 60) {
  const snapshot = await getDocs(query(profilesCollection, orderBy('createdAt', 'desc'), limit(max)));
  return snapshot.docs.map(fromSnapshot);
}

// ---------- MODIFICAR ----------

export function updateBio(uid, bio) {
  return safeWrite(() => updateDoc(publicProfileRef(uid), { bio: bio.trim().slice(0, BIO_MAX_LENGTH) }));
}

// Guarda el Top 5. Si notify es true, publica "actualizó su Top 5" en la comunidad (mismo lote).
export async function saveTop5(uid, albums, { notify, author }) {
  const top5 = albums.slice(0, TOP5_SIZE).map(albumSummary);
  const batch = writeBatch(db);
  batch.update(publicProfileRef(uid), { top5 });
  if (notify && top5.length > 0) {
    batch.set(doc(collection(db, 'posts')), {
      ...author,
      uid,
      type: 'top5',
      top5,
      likeCount: 0,
      replyCount: 0,
      repostCount: 0,
      createdAt: serverTimestamp(),
    });
  }
  await safeWrite(() => batch.commit());
}

// "Escuchado recientemente" (lo escribe la sincronización con Spotify).
export function updateRecent(uid, recent) {
  return safeWrite(() => updateDoc(publicProfileRef(uid), { recent }));
}
