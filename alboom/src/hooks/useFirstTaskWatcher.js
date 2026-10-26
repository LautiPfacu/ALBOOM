// Marca la primera tarea como hecha cuando hay un disco guardado con puntaje y reseña.
// Vive en Layout: así funciona en cualquier pantalla (inicio, ficha del disco, biblioteca).

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { updateFirstTask } from '../services/profile';

export function useFirstTaskWatcher() {
  const { user, profile } = useAuth();
  const { items } = useLibrary();
  const { showToast } = useToast();

  const started = profile?.firstTask === 'started';
  const completed = items.some((item) => item.rating > 0 && item.review?.trim());

  useEffect(() => {
    if (!started || !completed) return;
    updateFirstTask(user.uid, 'done')
      .then(() => showToast({ type: 'success', message: '¡Primera tarea hecha! Ya arrancó tu ALBOOM.' }))
      .catch(() => {});
  }, [started, completed, user, showToast]);
}
