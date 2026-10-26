// Pop-up "Escuchaste esto en Spotify": discos de esta semana que no están en tu biblioteca.
// "Escuchado" lo suma con la fecha de hoy, "Pendiente" lo guarda para después y × lo descarta.

import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuthor } from '../hooks/useAuthor';
import { addToLibrary, libraryErrorMessage, STATUS } from '../services/library';
import { dismissAlbum } from '../services/profile';
import AlbumCover from './AlbumCover';
import Button from './Button';
import Dialog from './Dialog';
import './SpotifyDialogs.css';

export default function SpotifySuggestionsDialog({ open, onClose, suggestions }) {
  const { author, postListened, publicReviewsDefault } = useAuthor();
  const { showToast } = useToast();
  // Qué fila está guardando y cómo ('escuchado' | 'pendiente' | 'descartar')
  const [pending, setPending] = useState({ id: null, action: null });

  async function handle(album, action) {
    setPending({ id: album.albumId, action });
    try {
      if (action === 'descartar') {
        await dismissAlbum(author.uid, album.albumId);
      } else {
        await addToLibrary(author.uid, album, action, { isPublic: publicReviewsDefault, postListened, author });
        showToast({ type: 'success', message: `${album.name} se guardó en tu biblioteca.` });
      }
    } catch (error) {
      showToast({ type: 'error', message: libraryErrorMessage(error) });
    } finally {
      setPending({ id: null, action: null });
    }
  }

  return (
    <Dialog open={open} onClose={onClose} labelledBy="spotify-suggestions-title" className="dialog--wide">
      <div className="dialog__header">
        <div className="dialog__heading">
          <h2 id="spotify-suggestions-title" className="dialog__title">
            Escuchaste esto en Spotify
          </h2>
          <p className="dialog__text">
            Discos que pusiste esta semana y no están en tu biblioteca. Elegí cómo sumarlos.
          </p>
        </div>
        <button type="button" className="dialog__close" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>
      </div>

      {suggestions.length === 0 && <p className="dialog__text">Ya sumaste todo lo que escuchaste esta semana.</p>}
      <ul className="spotify-suggestions">
        {suggestions.map((album) => {
          const busy = pending.id === album.albumId;
          return (
            <li key={album.albumId} className="spotify-suggestions__row">
              <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="spotify-suggestions__cover" />
              <span className="spotify-suggestions__info">
                <span className="spotify-suggestions__name">{album.name}</span>
                <span className="dialog__text">
                  {album.artist} · {album.tracksThisWeek} {album.tracksThisWeek === 1 ? 'canción' : 'canciones'} esta semana
                </span>
              </span>
              <span className="spotify-suggestions__actions">
                <Button
                  variant="secondary"
                  size="sm"
                  pending={busy && pending.action === STATUS.LISTENED}
                  disabled={busy}
                  onClick={() => handle(album, STATUS.LISTENED)}
                >
                  Escuchado
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  pending={busy && pending.action === STATUS.PENDING}
                  disabled={busy}
                  onClick={() => handle(album, STATUS.PENDING)}
                >
                  Pendiente
                </Button>
                <button
                  type="button"
                  className="spotify-suggestions__dismiss"
                  aria-label={`No sugerir más ${album.name}`}
                  disabled={busy}
                  onClick={() => handle(album, 'descartar')}
                >
                  ×
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="spotify-suggestions__footer">
        <span className="dialog__text">«Escuchado» los suma con la fecha de hoy.</span>
        <Button onClick={onClose}>Listo</Button>
      </div>
    </Dialog>
  );
}
