// Pop-up "Tu Spotify" (conectado): cuenta, 3 interruptores y "Desconectar Spotify".

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useSpotify } from '../hooks/useSpotify';
import { disconnectSpotify, updateSpotifySettings } from '../services/spotifyUser';
import { writeErrorMessage } from '../services/writes';
import { timeAgo } from '../utils/text';
import Dialog from './Dialog';
import './SpotifyDialogs.css';

const SWITCHES = [
  {
    key: 'useForRecommendations',
    title: 'Recomendaciones con lo que escucho',
    text: 'Mezcla tus géneros de ALBOOM con lo que escuchaste en Spotify.',
  },
  {
    key: 'showRecent',
    title: 'Mostrar «Escuchado recientemente»',
    text: 'Aparece en tu perfil para quien pueda verlo.',
  },
  {
    key: 'suggest',
    title: 'Sugerirme discos para la biblioteca',
    text: 'Te avisamos cuando escuchás un disco que no guardaste.',
  },
];

export default function SpotifySettingsDialog({ open, onClose }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { spotify, settings, displayName, lastSync } = useSpotify();
  const settingsAction = useAsyncAction((next) => updateSpotifySettings(user.uid, spotify, next));
  const disconnectAction = useAsyncAction(() => disconnectSpotify(user.uid));

  async function toggle(key) {
    try {
      await settingsAction.run({ ...settings, [key]: !settings[key] });
    } catch (error) {
      showToast({ type: 'error', message: writeErrorMessage(error) });
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectAction.run();
      showToast({ type: 'success', message: 'Desconectaste tu Spotify.' });
      onClose();
    } catch (error) {
      showToast({ type: 'error', message: writeErrorMessage(error) });
    }
  }

  return (
    <Dialog open={open} onClose={onClose} labelledBy="spotify-settings-title">
      <div className="dialog__header">
        <h2 id="spotify-settings-title" className="dialog__title">
          Tu Spotify
        </h2>
        <button type="button" className="dialog__close" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="spotify-dialog__account">
        <span className="spotify-dialog__check" aria-hidden="true">
          ✓
        </span>
        <span>
          <strong>Conectada como {displayName}</strong>
          <span className="dialog__text">
            {lastSync ? `Última lectura: ${timeAgo(lastSync)}` : 'Todavía no leímos lo que escuchaste.'}
          </span>
        </span>
      </div>

      <div>
        {SWITCHES.map((item) => (
          <div key={item.key} className="setting-row">
            <div className="setting-row__text">
              <span className="setting-row__title" id={`spotify-${item.key}`}>
                {item.title}
              </span>
              <span className="setting-row__description">{item.text}</span>
            </div>
            <button
              type="button"
              role="switch"
              className="switch"
              aria-checked={settings[item.key]}
              aria-labelledby={`spotify-${item.key}`}
              disabled={settingsAction.pending}
              onClick={() => toggle(item.key)}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className="text-link spotify-dialog__disconnect"
        disabled={disconnectAction.pending}
        onClick={handleDisconnect}
      >
        {disconnectAction.pending ? 'Desconectando…' : 'Desconectar Spotify'}
      </button>
    </Dialog>
  );
}
