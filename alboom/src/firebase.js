// ★ Acá se conecta Firebase.
// Lee la configuración del archivo .env (variables VITE_) e inicializa Authentication y Firestore.

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  console.error(
    `Faltan variables de Firebase: ${missing.join(', ')}. ` +
      'Revisá el archivo .env (en local) o Settings → Environment Variables (en Vercel).',
  );
}

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
auth.useDeviceLanguage(); // la ventana de Google aparece en el idioma del navegador

export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
