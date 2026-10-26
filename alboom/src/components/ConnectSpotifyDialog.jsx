// Pop-up "Conectá tu Spotify": qué se lee, qué nunca se hace, "Conectar con Spotify" y "Ahora no".

import { useState } from 'react';
import { spotifyErrorMessage, startSpotifyLogin } from '../services/spotifyUser';
import Button from './Button';
import Dialog from './Dialog';
import { useT } from '../i18n/LanguageContext';
import './SpotifyDialogs.css';

export default function ConnectSpotifyDialog({ open, onClose }) {
  const [state, setState] = useState({ pending: false, error: null });
  const t = useT();

  async function handleConnect() {
    setState({ pending: true, error: null });
    try {
      // Nos lleva a Spotify: si sale bien, la página cambia y no vuelve acá.
      await startSpotifyLogin();
    } catch (error) {
      setState({ pending: false, error: spotifyErrorMessage(error) });
    }
  }

  return (
    <Dialog open={open} onClose={onClose} labelledBy="connect-spotify-title">
      <div className="dialog__header">
        <div className="dialog__heading">
          <h2 id="connect-spotify-title" className="dialog__title">
            {t('Conectá tu Spotify')}
          </h2>
          <p className="dialog__text">
            {t('ALBOOM mira lo que escuchás para recomendarte mejor. Lo podés desconectar cuando quieras.')}
          </p>
        </div>
        <button type="button" className="dialog__close" aria-label={t('Cerrar')} onClick={onClose}>
          ×
        </button>
      </div>

      <h3 className="label-caps spotify-dialog__group">{t('Lo que vamos a leer')}</h3>
      <ul className="spotify-dialog__list">
        <li className="spotify-dialog__yes">{t('Lo que escuchaste en los últimos días.')}</li>
        <li className="spotify-dialog__yes">{t('Tus artistas más escuchados.')}</li>
      </ul>
      <h3 className="label-caps spotify-dialog__group">{t('Lo que nunca hacemos')}</h3>
      <ul className="spotify-dialog__list">
        <li className="spotify-dialog__no">{t('Publicar algo sin que lo marques vos.')}</li>
        <li className="spotify-dialog__no">{t('Ver tus playlists privadas o tus datos de pago.')}</li>
      </ul>

      {state.error && (
        <p className="dialog__error" role="alert">
          {t(state.error)}
        </p>
      )}
      <Button size="lg" block pending={state.pending} onClick={handleConnect}>
        {state.pending ? 'Abriendo Spotify…' : 'Conectar con Spotify'}
      </Button>
      <button type="button" className="text-link spotify-dialog__later" onClick={onClose}>
        {t('Ahora no')}
      </button>
    </Dialog>
  );
}
