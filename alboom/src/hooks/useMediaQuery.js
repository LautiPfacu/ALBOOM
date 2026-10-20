// ¿La pantalla cumple esta media query? Se actualiza sola si cambia el tamaño.
//   const isMobile = useMediaQuery('(max-width: 767px)');
//
// useSyncExternalStore es la forma de React de leer algo que vive afuera (acá, el navegador):
// subscribe se engancha al evento 'change' y devuelve la función que lo desengancha (cleanup).

import { useCallback, useSyncExternalStore } from 'react';

export const MOBILE_QUERY = '(max-width: 767px)';

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );
  const getSnapshot = () => window.matchMedia(query).matches;
  return useSyncExternalStore(subscribe, getSnapshot);
}
