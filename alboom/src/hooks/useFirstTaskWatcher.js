// Progreso de la primera tarea: qué pasos están hechos, a partir de la biblioteca y del perfil.
// Vive en Layout (por FirstTaskProgress): así funciona en cualquier pantalla
// (inicio, ficha del disco, biblioteca). Al completar los 4 pasos la marca como hecha.
//   const { active, steps, doneCount } = useFirstTaskWatcher();

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { updateFirstTask } from '../services/profile';

const millis = (value) => (typeof value?.toMillis === 'function' ? value.toMillis() : null);

export function useFirstTaskWatcher() {
  const { user, profile } = useAuth();
  const { items } = useLibrary();
  const { showToast } = useToast();

  const active = profile?.firstTask === 'started';
  // Mientras Firestore confirma la fecha de inicio llega null: hasta entonces no cuenta nada.
  const startedAt = millis(profile?.firstTaskStartedAt);

  // Guardado después de empezar (los discos del onboarding ya estaban).
  // Un disco recién guardado llega sin fecha hasta que Firestore confirma: también cuenta.
  const saved =
    startedAt !== null &&
    items.some((item) => {
      const addedAt = millis(item.addedAt);
      return addedAt === null || addedAt >= startedAt;
    });
  const rated = items.some((item) => item.rating > 0);
  const reviewed = items.some((item) => item.review?.trim());
  const searched = Boolean(profile?.firstTaskSearched) || saved;

  const steps = [
    { id: 'buscar', title: 'Buscá un disco', done: searched },
    { id: 'guardar', title: 'Guardalo', done: saved },
    { id: 'puntuar', title: 'Puntualo', done: rated },
    { id: 'resenar', title: 'Escribí tu reseña', done: reviewed },
  ];
  const doneCount = steps.filter((step) => step.done).length;
  const completed = doneCount === steps.length;

  useEffect(() => {
    if (!active || !completed) return;
    updateFirstTask(user.uid, 'done')
      .then(() => showToast({ type: 'success', message: '¡Primera tarea hecha! Ya arrancó tu ALBOOM.' }))
      .catch(() => {});
  }, [active, completed, user, showToast]);

  return { active, steps, doneCount };
}
