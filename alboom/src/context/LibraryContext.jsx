// Biblioteca del usuario disponible en todas las pantallas con sesión.
// Hay UNA sola suscripción a Firestore para toda la sesión (el provider envuelve al Layout).
//
//   const { items, loading, error, savedIds, getItem } = useLibrary();

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToLibrary } from '../services/library';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const uid = user.uid; // siempre hay usuario: este provider vive dentro de ProtectedRoute
  // Guardamos a qué uid pertenecen los datos, igual que AuthContext con el perfil.
  const [state, setState] = useState({ uid: null, items: [], error: null });

  // CONSULTAR: escuchamos users/{uid}/library en tiempo real (onSnapshot).
  useEffect(() => {
    return subscribeToLibrary(
      uid,
      (items) => setState({ uid, items, error: null }),
      () =>
        setState({
          uid,
          items: [],
          error: 'No pudimos cargar tu biblioteca. Revisá tu conexión y probá de nuevo.',
        }),
    );
  }, [uid]);

  // Mientras no llegó el primer snapshot de este uid, está cargando.
  const loading = state.uid !== uid;
  const items = useMemo(() => (loading ? [] : state.items), [loading, state.items]);

  // Datos derivados: se calculan a partir de items, no se guardan aparte.
  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const savedIds = useMemo(() => new Set(itemsById.keys()), [itemsById]);
  const getItem = useCallback((id) => itemsById.get(id), [itemsById]);

  const value = useMemo(
    () => ({ items, loading, error: loading ? null : state.error, savedIds, getItem }),
    [items, loading, state.error, savedIds, getItem],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary tiene que usarse dentro de <LibraryProvider>.');
  return context;
}
