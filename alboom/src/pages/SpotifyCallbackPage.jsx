// Spotify vuelve acá (/spotify/callback?code=…&state=…) después de que la persona acepta.
// Terminamos la conexión, leemos lo que escuchó y volvemos a tu perfil.
// Si Spotify rechaza la cuenta (no está habilitada en modo desarrollo), mostramos el error
// y el resto de la app sigue funcionando.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { finishSpotifyLogin, spotifyErrorMessage } from '../services/spotifyUser';
import Button from '../components/Button';
import ErrorState from '../components/ErrorState';
import FullPageLoader from '../components/FullPageLoader';
import './CommunityPage.css';

export default function SpotifyCallbackPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState(null);
  // El código de Spotify sirve una sola vez: evitamos usarlo dos veces (StrictMode monta dos veces).
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    finishSpotifyLogin(user.uid, params)
      .then(() => {
        showToast({ type: 'success', message: 'Conectaste tu Spotify.' });
        // Al volver al perfil, el Layout lee por primera vez lo que escuchaste (useSpotifySync).
        navigate('/perfil', { replace: true });
      })
      .catch((finishError) => setError(spotifyErrorMessage(finishError)));
  }, [user.uid, params, navigate, showToast]);

  if (!error) return <FullPageLoader label="Conectando tu Spotify…" />;

  return (
    <div className="page community__single">
      <ErrorState title="No pudimos conectar tu Spotify" message={error}>
        <Button to="/perfil" variant="secondary">
          Volver a tu perfil
        </Button>
      </ErrorState>
    </div>
  );
}
