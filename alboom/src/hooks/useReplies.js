// Respuestas de un posteo en tiempo real. Solo se suscribe cuando el hilo está abierto.
//   const { replies, loading, error } = useReplies(postId, open);

import { useEffect, useState } from 'react';
import { subscribeToReplies } from '../services/posts';

export function useReplies(postId, enabled) {
  const [state, setState] = useState({ postId: null, replies: [], error: null });

  useEffect(() => {
    if (!enabled) return undefined;
    return subscribeToReplies(
      postId,
      (replies) => setState({ postId, replies, error: null }),
      () => setState({ postId, replies: [], error: 'No pudimos cargar las respuestas.' }),
    );
  }, [postId, enabled]);

  const loading = enabled && state.postId !== postId;
  return { replies: loading ? [] : state.replies, loading, error: loading ? null : state.error };
}
