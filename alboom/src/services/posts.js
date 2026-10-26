// Posteos de la comunidad: posts/{postId}
//   type: 'review' | 'listened' | 'top5' | 'repost'
//   uid, username, displayName, photoURL (copia del autor), album?, rating?, text?, top5?, repostOf?
//   likeCount, replyCount, repostCount, createdAt
//   posts/{postId}/likes/{uid}           → { createdAt }
//   posts/{postId}/replies/{replyId}     → { uid, username, displayName, photoURL, text, createdAt }
//
// Los posteos de reseñas y de "escuchó" tienen un id fijo (review_{albumId}_{uid}) para poder
// actualizarlos o borrarlos junto con la biblioteca (library.js los escribe en el mismo lote).

import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { chunk, safeWrite } from './writes';

export const REPLY_MAX_LENGTH = 300;
const postsCollection = collection(db, 'posts');

export const postRef = (postId) => doc(db, 'posts', postId);
export const reviewPostId = (albumId, uid) => `review_${albumId}_${uid}`;
export const listenedPostId = (albumId, uid) => `listened_${albumId}_${uid}`;
const repostId = (postId, uid) => `repost_${postId}_${uid}`;
const likeRef = (postId, uid) => doc(db, 'posts', postId, 'likes', uid);
const repliesCollection = (postId) => collection(db, 'posts', postId, 'replies');

export const EMPTY_COUNTERS = { likeCount: 0, replyCount: 0, repostCount: 0 };

const fromSnapshot = (snapshot) => ({ id: snapshot.id, ...snapshot.data({ serverTimestamps: 'estimate' }) });
const millis = (value) => (typeof value?.toMillis === 'function' ? value.toMillis() : 0);
const byNewest = (a, b) => millis(b.createdAt) - millis(a.createdAt);

// ---------- CONSULTAR ----------

// "Siguiendo": los últimos `max` posteos de estas personas, en tiempo real.
// Firestore acepta 30 uids por consulta "in": hacemos una suscripción por grupo y mezclamos.
// (Necesita el índice compuesto posts: uid ↑ + createdAt ↓; Firestore da el link si falta.)
export function subscribeToPostsBy(uids, max, onData, onError) {
  const groups = chunk([...new Set(uids)]);
  if (groups.length === 0) {
    onData([]);
    return () => {};
  }
  const results = new Map(); // grupo → posteos
  const unsubscribes = groups.map((part, index) =>
    onSnapshot(
      query(postsCollection, where('uid', 'in', part), orderBy('createdAt', 'desc'), limit(max)),
      (snapshot) => {
        results.set(index, snapshot.docs.map(fromSnapshot));
        // Avisamos recién cuando respondieron todos los grupos.
        if (results.size === groups.length) onData([...results.values()].flat().sort(byNewest).slice(0, max));
      },
      onError,
    ),
  );
  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
}

// Últimos posteos de toda la comunidad (para "Para vos").
export async function getRecentPosts(max = 100) {
  const snapshot = await getDocs(query(postsCollection, orderBy('createdAt', 'desc'), limit(max)));
  return snapshot.docs.map(fromSnapshot);
}

// Un posteo en tiempo real (para los compartidos y la página de un posteo).
export function subscribeToPost(postId, onData, onError) {
  return onSnapshot(postRef(postId), (s) => onData(s.exists() ? fromSnapshot(s) : null), onError);
}

// ¿Ya le di me gusta? ¿Ya lo compartí?
export async function getMyReactions(postId, uid) {
  const [like, repost] = await Promise.all([getDoc(likeRef(postId, uid)), getDoc(postRef(repostId(postId, uid)))]);
  return { liked: like.exists(), reposted: repost.exists() };
}

// Respuestas de un posteo, de la más vieja a la más nueva, en tiempo real.
export function subscribeToReplies(postId, onData, onError) {
  return onSnapshot(
    query(repliesCollection(postId), orderBy('createdAt', 'asc')),
    (snapshot) => onData(snapshot.docs.map(fromSnapshot)),
    onError,
  );
}

// ---------- MODIFICAR ----------

// ME GUSTA: crea o borra likes/{uid} y ajusta likeCount en el mismo lote.
export async function setLike(postId, uid, liked) {
  const batch = writeBatch(db);
  if (liked) batch.set(likeRef(postId, uid), { createdAt: serverTimestamp() });
  else batch.delete(likeRef(postId, uid));
  batch.update(postRef(postId), { likeCount: increment(liked ? 1 : -1) });
  await safeWrite(() => batch.commit());
}

// RESPONDER: agrega la respuesta y suma 1 a replyCount.
export async function addReply(postId, author, text) {
  const batch = writeBatch(db);
  batch.set(doc(repliesCollection(postId)), {
    ...author,
    text: text.trim().slice(0, REPLY_MAX_LENGTH),
    createdAt: serverTimestamp(),
  });
  batch.update(postRef(postId), { replyCount: increment(1) });
  await safeWrite(() => batch.commit());
}

// COMPARTIR EN TU MURO: crea un posteo "repost" que apunta al original (o lo deshace).
export async function setRepost(post, author, reposted) {
  const batch = writeBatch(db);
  const ref = postRef(repostId(post.id, author.uid));
  if (reposted) {
    batch.set(ref, { ...author, type: 'repost', repostOf: post.id, ...EMPTY_COUNTERS, createdAt: serverTimestamp() });
  } else {
    batch.delete(ref);
  }
  batch.update(postRef(post.id), { repostCount: increment(reposted ? 1 : -1) });
  await safeWrite(() => batch.commit());
}

// BORRAR un posteo propio.
export async function deletePost(postId) {
  const batch = writeBatch(db);
  batch.delete(postRef(postId));
  await safeWrite(() => batch.commit());
}

// Para eliminar la cuenta: todos los posteos de la persona.
export async function getPostRefsBy(uid) {
  const snapshot = await getDocs(query(postsCollection, where('uid', '==', uid)));
  return snapshot.docs.map((d) => d.ref);
}
