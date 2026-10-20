// Perfil, ajustes y seguridad de la cuenta.
//   users/{uid}            → genres, theme, onboardingDone, username, settings…
//   usernames/{username}   → { uid }  (reserva del nombre de usuario, para que sea único)

import {
  deleteUser,
  EmailAuthProvider,
  linkWithPopup,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  unlink,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { normalizeText } from '../utils/text';

const profileRef = (uid) => doc(db, 'users', uid);
const usernameRef = (username) => doc(db, 'usernames', username);

export const USERNAME_PATTERN = /^[a-z0-9._]{3,20}$/;
export const DEFAULT_SETTINGS = { publicReviewsDefault: true, publicProfile: false };

// ---------- Primera vez ----------

// "Sofía Pérez" → "sofia.perez"
function usernameBase(displayName) {
  const base = normalizeText(displayName)
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._]/g, '')
    .slice(0, 15);
  return base.length >= 3 ? base : 'melomano';
}

// Guarda géneros, tema y onboardingDone en una sola escritura (una transacción).
// Si todavía no tiene nombre de usuario, le reserva uno libre en la misma transacción.
export async function completeOnboarding(uid, { genres, theme, displayName }) {
  await runTransaction(db, async (transaction) => {
    const profileSnapshot = await transaction.get(profileRef(uid));
    let username = profileSnapshot.data()?.username;

    if (!username) {
      const base = usernameBase(displayName);
      const candidates = [base, ...[1, 2, 3, 4].map(() => `${base}${Math.floor(Math.random() * 9000) + 100}`)];
      for (const candidate of candidates) {
        const taken = await transaction.get(usernameRef(candidate));
        if (!taken.exists()) {
          username = candidate;
          break;
        }
      }
      if (!username) throw new Error('No encontramos un nombre de usuario libre. Probá de nuevo.');
      transaction.set(usernameRef(username), { uid });
    }

    transaction.set(
      profileRef(uid),
      {
        genres,
        theme,
        username,
        onboardingDone: true,
        settings: profileSnapshot.data()?.settings ?? DEFAULT_SETTINGS,
        photoURL: auth.currentUser?.photoURL ?? null,
      },
      { merge: true },
    );
  });
}

// ---------- Ajustes de la app ----------

export function updateTheme(uid, theme) {
  return withTimeout(updateDoc(profileRef(uid), { theme }));
}

export function updateGenres(uid, genres) {
  return withTimeout(updateDoc(profileRef(uid), { genres }));
}

export function updateSettings(uid, settings) {
  return withTimeout(updateDoc(profileRef(uid), { settings }));
}

// ---------- Foto de perfil ----------

// photoURL: data URL ya achicada (utils/image.js) o null para quitarla.
// Se guarda en el perfil y se copia en las reseñas públicas, todo en un mismo lote.
export async function updatePhoto(uid, photoURL) {
  const reviewsSnapshot = await getDocs(query(collection(db, 'reviews'), where('uid', '==', uid)));
  const batch = writeBatch(db);
  batch.update(profileRef(uid), { photoURL });
  reviewsSnapshot.docs.forEach((review) => batch.update(review.ref, { photoURL }));
  await withTimeout(batch.commit());
}

// La foto que se muestra: la del perfil de ALBOOM. Si el perfil todavía no tiene el campo,
// la de la cuenta de Google. Si la persona la quitó (null), ninguna: se ve la inicial.
export function photoFor(profile, user) {
  if (profile && 'photoURL' in profile) return profile.photoURL;
  return user?.photoURL ?? null;
}

// ---------- Recomendaciones descartadas ("No me interesa") ----------
//   users/{uid}/dismissed/{albumId} → { createdAt }

const dismissedCollection = (uid) => collection(db, 'users', uid, 'dismissed');

// Escucha la lista de discos descartados. Devuelve la función para dejar de escuchar.
export function subscribeToDismissed(uid, onData, onError) {
  return onSnapshot(
    dismissedCollection(uid),
    (snapshot) => onData(snapshot.docs.map((d) => d.id)),
    onError,
  );
}

export function dismissAlbum(uid, albumId) {
  return withTimeout(setDoc(doc(dismissedCollection(uid), albumId), { createdAt: serverTimestamp() }));
}

export function undismissAlbum(uid, albumId) {
  return withTimeout(deleteDoc(doc(dismissedCollection(uid), albumId)));
}

// ---------- Tu cuenta ----------

// ¿Está libre este nombre de usuario? (el propio cuenta como libre)
export async function isUsernameAvailable(username, uid) {
  const snapshot = await getDoc(usernameRef(username));
  return !snapshot.exists() || snapshot.data().uid === uid;
}

// Cambia nombre y/o nombre de usuario. El cambio de usuario libera el viejo y reserva el nuevo
// en una transacción, así dos personas no pueden quedarse con el mismo.
export async function updateAccount(uid, { displayName, username, previousUsername }) {
  await withTimeout(
    runTransaction(db, async (transaction) => {
      if (username !== previousUsername) {
        const taken = await transaction.get(usernameRef(username));
        if (taken.exists() && taken.data().uid !== uid) {
          throw new ProfileError('app/username-taken');
        }
        if (!taken.exists()) transaction.set(usernameRef(username), { uid });
        if (previousUsername) transaction.delete(usernameRef(previousUsername));
      }
      transaction.update(profileRef(uid), { displayName: displayName.trim(), username });
    }),
  );
  if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: displayName.trim() });
}

// Firebase manda un mail al email nuevo; el cambio se aplica cuando la persona lo confirma.
export function changeEmail(newEmail) {
  return verifyBeforeUpdateEmail(auth.currentUser, newEmail.trim());
}

// ---------- Seguridad ----------

export function providerIds(user) {
  return (user?.providerData ?? []).map((provider) => provider.providerId);
}

// Pide la contraseña actual otra vez (Firebase lo exige para operaciones sensibles).
async function reauthenticate(password) {
  const user = auth.currentUser;
  if (providerIds(user).includes('password')) {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  } else {
    await reauthenticateWithPopup(user, googleProvider);
  }
}

export async function changePassword(currentPassword, newPassword) {
  await reauthenticate(currentPassword);
  await updatePassword(auth.currentUser, newPassword);
}

export function connectGoogle() {
  return linkWithPopup(auth.currentUser, googleProvider);
}

export function disconnectGoogle() {
  return unlink(auth.currentUser, 'google.com');
}

// ---------- Tus datos ----------

async function getUserData(uid) {
  const [profileSnapshot, librarySnapshot, reviewsSnapshot, dismissedSnapshot] = await Promise.all([
    getDoc(profileRef(uid)),
    getDocs(collection(db, 'users', uid, 'library')),
    getDocs(query(collection(db, 'reviews'), where('uid', '==', uid))),
    getDocs(collection(db, 'users', uid, 'dismissed')),
  ]);
  return { profileSnapshot, librarySnapshot, reviewsSnapshot, dismissedSnapshot };
}

// Arma un JSON con perfil, biblioteca y reseñas. Las fechas pasan a texto ISO.
export async function exportUserData(uid) {
  const { profileSnapshot, librarySnapshot, reviewsSnapshot } = await getUserData(uid);
  const plain = (data) =>
    JSON.parse(JSON.stringify(data, (key, value) => (value?.toDate ? value.toDate().toISOString() : value)));
  const content = {
    exportadoEl: new Date().toISOString(),
    perfil: plain(profileSnapshot.data() ?? {}),
    biblioteca: librarySnapshot.docs.map((d) => plain({ id: d.id, ...d.data() })),
    resenas: reviewsSnapshot.docs.map((d) => plain({ id: d.id, ...d.data() })),
  };
  return new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
}

// Eliminar cuenta: reautenticación → borrado de documentos en lotes → deleteUser.
export async function deleteAccount(uid, password) {
  await reauthenticate(password);
  const { profileSnapshot, librarySnapshot, reviewsSnapshot, dismissedSnapshot } = await getUserData(uid);
  const refs = [
    ...librarySnapshot.docs.map((d) => d.ref),
    ...reviewsSnapshot.docs.map((d) => d.ref),
    ...dismissedSnapshot.docs.map((d) => d.ref),
  ];
  const username = profileSnapshot.data()?.username;
  if (username) refs.push(usernameRef(username));
  refs.push(profileRef(uid));

  // Un writeBatch admite hasta 500 operaciones.
  for (let i = 0; i < refs.length; i += 450) {
    const batch = writeBatch(db);
    refs.slice(i, i + 450).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  await deleteUser(auth.currentUser);
}

// ---------- Ayuda ----------

export function sendReport(uid, { email, screen, message }) {
  return withTimeout(
    addDoc(collection(db, 'reports'), {
      uid,
      email: email ?? null,
      screen: screen.trim(),
      message: message.trim(),
      createdAt: serverTimestamp(),
    }),
  );
}

// ---------- Ayudas ----------

class ProfileError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

// Sin conexión, Firestore deja la escritura en cola: cortamos a los 10 s para mostrar un error.
function withTimeout(promise) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return Promise.reject(new ProfileError('app/offline'));
  }
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new ProfileError('app/timeout')), 10_000);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const PROFILE_ERRORS = {
  'app/offline': 'Sin conexión. Revisá internet y probá de nuevo.',
  'app/timeout': 'Firestore tardó demasiado en responder. Revisá tu conexión.',
  'app/username-taken': 'Ese nombre de usuario ya está en uso.',
  'permission-denied': 'No tenés permiso para hacer esto. Volvé a iniciar sesión.',
  'auth/wrong-password': 'La contraseña actual no es correcta.',
  'auth/invalid-credential': 'La contraseña actual no es correcta.',
  'auth/missing-password': 'Escribí tu contraseña actual.',
  'auth/weak-password': 'La contraseña tiene que tener al menos 6 caracteres.',
  'auth/requires-recent-login': 'Por seguridad, cerrá sesión y volvé a entrar antes de hacer este cambio.',
  'auth/email-already-in-use': 'Ya hay una cuenta con ese email.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/credential-already-in-use': 'Esa cuenta de Google ya está conectada a otro usuario.',
  'auth/provider-already-linked': 'Tu cuenta de Google ya está conectada.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permití las ventanas emergentes.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá un momento y probá de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisá internet y probá de nuevo.',
};

export function profileErrorMessage(error) {
  if (error?.code) return PROFILE_ERRORS[error.code] ?? 'No pudimos guardar el cambio. Probá de nuevo.';
  return error?.message || 'No pudimos guardar el cambio. Probá de nuevo.';
}
