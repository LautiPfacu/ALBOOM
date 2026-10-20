// Sesión del usuario disponible en toda la app: const { user, displayName, loading } = useAuth();

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { subscribeToProfile } from '../services/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Guardamos a qué uid pertenece el perfil para no mostrar el de otra sesión.
  const [profileState, setProfileState] = useState({ uid: null, data: null });

  // Firebase avisa cada vez que alguien entra o sale, y también al recargar la página.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Perfil en Firestore (users/{uid}) en tiempo real.
  useEffect(() => {
    if (!user) return undefined;
    const { uid } = user;
    return subscribeToProfile(
      uid,
      (data) => setProfileState({ uid, data }),
      () => setProfileState({ uid, data: null }),
    );
  }, [user]);

  const profile = user && profileState.uid === user.uid ? profileState.data : null;

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      displayName: profile?.displayName || user?.displayName || user?.email?.split('@')[0] || '',
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth tiene que usarse dentro de <AuthProvider>.');
  return context;
}
