// Cierra un menú desplegable con Escape o con un clic afuera.
//   const ref = useRef(null);
//   useDismiss(open, () => setOpen(false), ref);
// Son suscripciones a eventos del documento: el cleanup las saca cuando el menú se cierra.

import { useEffect } from 'react';

export function useDismiss(open, onDismiss, containerRef) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onDismiss();
    }
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) onDismiss();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open, onDismiss, containerRef]);
}
