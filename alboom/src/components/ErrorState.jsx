// Error de carga (Spotify o Firestore) con botón para reintentar.
//
//   <ErrorState message={error} onRetry={retry} />
//   <ErrorState message={error} onRetry={retry}><Button to="/">Volver al inicio</Button></ErrorState>

import Button from './Button';
import { useT } from '../i18n/LanguageContext';
import './ErrorState.css';

export default function ErrorState({ title = 'Se cortó la música', message, onRetry, children }) {
  const t = useT();
  return (
    <div className="error-state" role="alert">
      <h2 className="error-state__title">{t(title)}</h2>
      {message && <p className="error-state__message">{t(message)}</p>}
      {(onRetry || children) && (
        <div className="error-state__actions">
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              Reintentar
            </Button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
