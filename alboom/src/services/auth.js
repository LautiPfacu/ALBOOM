// Cuentas de usuario con Firebase Authentication (email/contraseña y Google).
// Las contraseñas las guarda Firebase; nunca pasan por Firestore.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { ensureUserProfile } from './users';

export async function registerWithEmail({ name, email, password }) {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(user, { displayName: name.trim() });
  await ensureUserProfile({ uid: user.uid, email: user.email, displayName: name });
  return user;
}

export async function loginWithEmail({ email, password }) {
  const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
  await ensureUserProfile({ uid: user.uid, email: user.email, displayName: user.displayName });
  return user;
}

export async function loginWithGoogle() {
  const { user } = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile({ uid: user.uid, email: user.email, displayName: user.displayName });
  return user;
}

export function logout() {
  return signOut(auth);
}

const AUTH_ERRORS = {
  'auth/invalid-email': 'El email no es válido.',
  'auth/missing-password': 'Escribí tu contraseña.',
  'auth/weak-password': 'La contraseña tiene que tener al menos 6 caracteres.',
  'auth/email-already-in-use': 'Ya hay una cuenta con ese email. Probá en «Entrar».',
  'auth/invalid-credential': 'El email o la contraseña no son correctos.',
  'auth/user-not-found': 'El email o la contraseña no son correctos.',
  'auth/wrong-password': 'El email o la contraseña no son correctos.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá un momento y probá de nuevo.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
  'auth/cancelled-popup-request': 'Cerraste la ventana de Google antes de terminar.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permití las ventanas emergentes.',
  'auth/unauthorized-domain':
    'Este dominio no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados).',
  'auth/network-request-failed': 'Sin conexión. Revisá internet y probá de nuevo.',
};

export function authErrorMessage(error) {
  return AUTH_ERRORS[error?.code] ?? 'No pudimos completar la operación. Probá de nuevo.';
}
