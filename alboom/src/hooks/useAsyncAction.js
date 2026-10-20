// Envuelve una función async y expone si está en curso.
//
//   const { run, pending } = useAsyncAction((rating) => updateRating(uid, albumId, rating));
//   <button disabled={pending} onClick={() => run(4.5)}>
//
// - Mientras una llamada está en curso, las nuevas se ignoran (sin doble envío).
// - Devuelve el resultado o relanza el error: quien llama decide qué mostrar.
// - No toca el estado si el componente ya se desmontó.

import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsyncAction(action) {
  const [pending, setPending] = useState(false);
  // Refs: valores que no necesitan redibujar y que leemos dentro de run sin quedar desactualizados.
  const pendingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args) => {
      if (pendingRef.current) return undefined;
      pendingRef.current = true;
      setPending(true);
      try {
        return await action(...args);
      } finally {
        pendingRef.current = false;
        if (mountedRef.current) setPending(false);
      }
    },
    [action],
  );

  return { run, pending };
}
