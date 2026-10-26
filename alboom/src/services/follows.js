// Seguir y dejar de seguir: follows/{followerUid}_{followedUid} → { follower, followed, createdAt }
// Todos los perfiles son públicos: seguir es inmediato (sin solicitudes).
// Los contadores de los dos perfiles se actualizan en el mismo writeBatch con increment().

import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getProfiles, publicProfileRef } from './publicProfile';
import { chunk, safeWrite } from './writes';

const followsCollection = collection(db, 'follows');
const followRef = (follower, followed) => doc(db, 'follows', `${follower}_${followed}`);

// SEGUIR: crea el vínculo y suma 1 a "seguidos" (vos) y a "seguidores" (la otra persona).
export async function follow(me, them) {
  const batch = writeBatch(db);
  batch.set(followRef(me, them), { follower: me, followed: them, createdAt: serverTimestamp() });
  batch.update(publicProfileRef(me), { followingCount: increment(1) });
  batch.update(publicProfileRef(them), { followersCount: increment(1) });
  await safeWrite(() => batch.commit());
}

// DEJAR DE SEGUIR: borra el vínculo y resta 1 en los dos contadores.
export async function unfollow(me, them) {
  const batch = writeBatch(db);
  batch.delete(followRef(me, them));
  batch.update(publicProfileRef(me), { followingCount: increment(-1) });
  batch.update(publicProfileRef(them), { followersCount: increment(-1) });
  await safeWrite(() => batch.commit());
}

// A quiénes sigo, en tiempo real. onData recibe un array de uids.
export function subscribeToFollowing(uid, onData, onError) {
  return onSnapshot(
    query(followsCollection, where('follower', '==', uid)),
    (snapshot) => onData(snapshot.docs.map((d) => d.data().followed)),
    onError,
  );
}

// ¿Esta persona me sigue?
export async function followsMe(them, me) {
  const snapshot = await getDoc(followRef(them, me));
  return snapshot.exists();
}

// Seguidores o seguidos de alguien, con su perfil público. → [perfil]
export async function getFollowList(uid, kind) {
  const field = kind === 'followers' ? 'followed' : 'follower';
  const other = kind === 'followers' ? 'follower' : 'followed';
  const snapshot = await getDocs(query(followsCollection, where(field, '==', uid)));
  const uids = snapshot.docs.map((d) => d.data()[other]);
  const profiles = await getProfiles(uids);
  return uids.map((id) => profiles.get(id)).filter(Boolean);
}

// Seguidores en común: de las personas que yo sigo, ¿cuáles siguen a `them`? → [perfil]
export async function getCommonFollowers(myFollowing, them) {
  if (myFollowing.length === 0) return [];
  const snapshots = await Promise.all(
    chunk(myFollowing).map((part) =>
      getDocs(query(followsCollection, where('followed', '==', them), where('follower', 'in', part))),
    ),
  );
  const uids = snapshots.flatMap((s) => s.docs).map((d) => d.data().follower);
  const profiles = await getProfiles(uids);
  return uids.map((id) => profiles.get(id)).filter(Boolean);
}

// A quiénes siguen las personas que yo sigo (para el motivo "Lo siguen Tomás y Juli").
// → Map(uidSeguido → [uids de mis seguidos que lo siguen])
export async function getFollowedByMyFollowing(myFollowing) {
  if (myFollowing.length === 0) return new Map();
  const snapshots = await Promise.all(
    chunk(myFollowing).map((part) => getDocs(query(followsCollection, where('follower', 'in', part)))),
  );
  const result = new Map();
  snapshots
    .flatMap((s) => s.docs)
    .forEach((d) => {
      const { follower, followed } = d.data();
      result.set(followed, [...(result.get(followed) ?? []), follower]);
    });
  return result;
}

// Para eliminar la cuenta: todos los vínculos donde participa la persona.
export async function getAllFollowRefs(uid) {
  const [asFollower, asFollowed] = await Promise.all([
    getDocs(query(followsCollection, where('follower', '==', uid))),
    getDocs(query(followsCollection, where('followed', '==', uid))),
  ]);
  return [...asFollower.docs, ...asFollowed.docs].map((d) => d.ref);
}
