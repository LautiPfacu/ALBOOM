// Un disco de la biblioteca en tiempo real.
//
//   const { item, loading, error } = useLibraryItem(albumId);
//   item === null → el disco no está guardado

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToLibraryItem } from '../services/library';

export function useLibraryItem(albumId) {
  const { user } = useAuth();
  const uid = user.uid;
  const key = `${uid}/${albumId}`;
  const [state, setState] = useState({ key: null, item: null, error: null });

  // CONSULTAR: escuchamos users/{uid}/library/{albumId}. El cleanup corta la suscripción.
  useEffect(() => {
    return subscribeToLibraryItem(
      uid,
      albumId,
      (item) => setState({ key, item, error: null }),
      () => setState({ key, item: null, error: 'No pudimos leer este disco de tu biblioteca.' }),
    );
  }, [uid, albumId, key]);

  const loading = state.key !== key;
  return {
    item: loading ? null : state.item,
    loading,
    error: loading ? null : state.error,
  };
}
