// Muestra los avisos de ToastContext abajo a la derecha (en celular, arriba de la TabBar).

import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './ToastViewport.css';

export default function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="toast-viewport">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const { action } = toast;
        return (
          <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            // Éxito: se anuncia cuando el lector termina. Error: se anuncia enseguida.
            role={isError ? 'alert' : 'status'}
          >
            <span className="toast__icon" aria-hidden="true">
              {isError ? '!' : '✓'}
            </span>
            <span className="toast__message">{toast.message}</span>
            {action?.to && (
              <Link to={action.to} className="toast__action" onClick={() => dismissToast(toast.id)}>
                {action.label}
              </Link>
            )}
            {action?.onClick && (
              <button
                type="button"
                className="toast__action"
                onClick={() => {
                  dismissToast(toast.id);
                  action.onClick();
                }}
              >
                {action.label}
              </button>
            )}
            <button
              type="button"
              className="toast__close"
              aria-label="Cerrar aviso"
              onClick={() => dismissToast(toast.id)}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
