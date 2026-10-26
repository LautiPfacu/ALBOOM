// Tarjeta "Desde tu Spotify" (solo en tu perfil). Dos estados: sin conectar y conectado.

import { useMemo, useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useDismissed } from '../hooks/useDismissed';
import { useSpotify } from '../hooks/useSpotify';
import { plural } from '../utils/text';
import AlbumCover from './AlbumCover';
import Button from './Button';
import ConnectSpotifyDialog from './ConnectSpotifyDialog';
import SpotifySettingsDialog from './SpotifySettingsDialog';
import SpotifySuggestionsDialog from './SpotifySuggestionsDialog';
import './SideCard.css';
import './SpotifyDialogs.css';

export default function SpotifyCard() {
  const { connected, settings, suggestions, loading } = useSpotify();
  const { savedIds } = useLibrary();
  const dismissed = useDismissed();
  const [open, setOpen] = useState(null); // 'connect' | 'settings' | 'suggestions'

  // Lo que ya guardaste o descartaste no se vuelve a sugerir.
  const pendingSuggestions = useMemo(
    () => suggestions.filter((album) => !savedIds.has(album.albumId) && !dismissed.has(album.albumId)),
    [suggestions, savedIds, dismissed],
  );

  return (
    <aside className="side-card" aria-labelledby="spotify-card-title">
      <div className="side-card__header">
        <h2 id="spotify-card-title" className="side-card__title">
          Desde tu Spotify
        </h2>
        {connected && <span className="side-card__badge">Conectado</span>}
      </div>

      {!connected && (
        <>
          <p className="side-card__text">
            Conectalo para ver lo que escuchaste, sumarlo a tu biblioteca y recibir mejores recomendaciones.
          </p>
          <Button block onClick={() => setOpen('connect')}>
            Conectar Spotify
          </Button>
        </>
      )}

      {connected && !loading && settings.suggest && (
        <>
          <p className="side-card__text">
            {pendingSuggestions.length > 0
              ? `Esta semana escuchaste ${plural(pendingSuggestions.length, 'disco')} que no ${
                  pendingSuggestions.length === 1 ? 'está' : 'están'
                } en tu biblioteca.`
              : 'Todo lo que escuchaste esta semana ya está en tu biblioteca.'}
          </p>
          {pendingSuggestions.length > 0 && (
            <>
              <div className="spotify-card__covers">
                {pendingSuggestions.slice(0, 3).map((album) => (
                  <AlbumCover key={album.albumId} src={album.cover} name={album.name} artist={album.artist} />
                ))}
              </div>
              <Button block onClick={() => setOpen('suggestions')}>
                Revisar y sumar
              </Button>
            </>
          )}
        </>
      )}

      {connected && (
        <button type="button" className="text-link spotify-card__settings" onClick={() => setOpen('settings')}>
          Ajustes de Spotify
        </button>
      )}

      <ConnectSpotifyDialog open={open === 'connect'} onClose={() => setOpen(null)} />
      <SpotifySettingsDialog open={open === 'settings'} onClose={() => setOpen(null)} />
      <SpotifySuggestionsDialog
        open={open === 'suggestions'}
        onClose={() => setOpen(null)}
        suggestions={pendingSuggestions}
      />
    </aside>
  );
}
