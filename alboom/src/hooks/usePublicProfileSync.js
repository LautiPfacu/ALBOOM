// Mantiene al día la copia pública de tu perfil (profiles/{uid}).
// Cuando cambian tu nombre, usuario, foto o géneros en el perfil privado, los copia al público.
// También crea el perfil público de las cuentas que existían antes de esta versión.
// Se usa una sola vez, en el Layout.

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { photoFor } from '../services/profile';
import { isPublicProfileInSync, publicFieldsFrom, syncPublicProfile } from '../services/publicProfile';
import { usePublicProfile } from './usePublicProfile';

export function usePublicProfileSync() {
  const { user, profile } = useAuth();
  const { profile: publicProfile, loading } = usePublicProfile(user.uid);

  const fields = publicFieldsFrom(profile, photoFor(profile, user));
  // Una clave de texto con los datos: el efecto corre solo cuando algo cambia de verdad.
  const fieldsKey = JSON.stringify(fields);
  const inSync = isPublicProfileInSync(publicProfile, fields);
  const ready = !loading && Boolean(profile?.username);

  useEffect(() => {
    if (!ready || inSync) return;
    // Si falla (por ejemplo, sin conexión), se reintenta la próxima vez que cambie algo.
    syncPublicProfile(user.uid, JSON.parse(fieldsKey), Boolean(publicProfile)).catch(() => {});
  }, [ready, inSync, fieldsKey, user.uid, publicProfile]);
}
