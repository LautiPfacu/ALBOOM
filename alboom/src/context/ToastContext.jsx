// Avisos (toasts) para toda la app: const { showToast } = useToast();
//
//   showToast({ type: 'success', message: 'Reseña guardada.' })
//   showToast({ type: 'error', message: '...', action: { label: 'Reintentar', onClick: retry } })
//   showToast({ type: 'success', message: '...', action: { label: 'Puntuar', to: '/disco/123' } })

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

const MAX_TOASTS = 3;
const DURATION_MS = { success: 4000, error: 7000 };

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // Un timer por aviso, para poder cancelarlo si se cierra antes con la ×.
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    clearTimeout(timersRef.current.get(id));
    timersRef.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = 'success', message, action }) => {
      const id = nextId++;
      // Como máximo 3 a la vez: si llega uno nuevo, se va el más viejo.
      setToasts((current) => [...current, { id, type, message, action }].slice(-MAX_TOASTS));
      timersRef.current.set(
        id,
        setTimeout(() => dismissToast(id), DURATION_MS[type] ?? DURATION_MS.success),
      );
    },
    [dismissToast],
  );

  // Al desmontar, limpiamos todos los timers pendientes.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast tiene que usarse dentro de <ToastProvider>.');
  return context;
}
