// Carga infinita: cuando el "sentinel" (un elemento al final de la lista) entra en pantalla,
// llama a onLoadMore. Usa IntersectionObserver, que avisa sin tener que escuchar el scroll.
//   const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading);
//   <div ref={sentinelRef} />
//
// Devuelve un "callback ref" (una función): así el efecto se entera cuando el sentinel aparece
// en pantalla por primera vez (por ejemplo, después de que terminó de cargar la lista).

import { useEffect, useState } from 'react';

export function useInfiniteScroll(onLoadMore, enabled) {
  const [sentinel, setSentinel] = useState(null);

  useEffect(() => {
    if (!enabled || !sentinel) return undefined;
    // rootMargin: empieza a cargar un poco antes de llegar al final.
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && onLoadMore(), {
      rootMargin: '400px',
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, onLoadMore, enabled]);

  return setSentinel;
}
