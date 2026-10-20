// Perfil de cada usuario en Firestore: users/{uid}

import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const profileRef = (uid) => doc(db, 'users', uid);

// Crea users/{uid} la primera vez que alguien entra. Si ya existe, no lo toca.
export async function ensureUserProfile({ uid, email, displayName }) {
  const ref = profileRef(uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;

  await setDoc(ref, {
    displayName: displayName?.trim() || email?.split('@')[0] || 'Melómano',
    email: email ?? null,
    createdAt: serverTimestamp(),
  });
}

// Escucha el perfil en tiempo real. Devuelve la función para dejar de escuchar.
export function subscribeToProfile(uid, onData, onError) {
  return onSnapshot(
    profileRef(uid),
    (snapshot) => onData(snapshot.exists() ? snapshot.data() : null),
    onError,
  );
}
