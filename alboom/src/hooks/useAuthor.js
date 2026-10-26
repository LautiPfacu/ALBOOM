// Tus datos como autor de reseñas y posteos, y tus preferencias de publicación.
//   const { author, postListened, publicReviewsDefault } = useAuthor();

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { photoFor } from '../services/profile';

export function useAuthor() {
  const { user, profile, displayName } = useAuth();
  const photoURL = photoFor(profile, user);

  const author = useMemo(
    () => ({ uid: user.uid, username: profile?.username ?? '', displayName, photoURL }),
    [user.uid, profile?.username, displayName, photoURL],
  );

  return {
    author,
    // "Publicar cuando marco un disco como escuchado" (apagado por defecto)
    postListened: profile?.settings?.postListened ?? false,
    // "Mostrar mis reseñas nuevas en la comunidad" (prendido por defecto)
    publicReviewsDefault: profile?.settings?.publicReviewsDefault ?? true,
  };
}
