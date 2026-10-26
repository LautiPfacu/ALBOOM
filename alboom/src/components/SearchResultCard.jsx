// Un resultado de búsqueda: portada, título, "Artista · Año" y el botón según la biblioteca:
//   "✓ Escuchado" (verde) · "En tu biblioteca" (amarillo, pendiente) · "Guardar" → "Guardando…"
//
//   libraryStatus: 'escuchado' | 'pendiente' | undefined (no está guardado)

import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useAuthor } from '../hooks/useAuthor';
import { addToLibrary, libraryErrorMessage, STATUS } from '../services/library';
import AlbumCover from './AlbumCover';
import Button from './Button';
import { useRequireAccount } from '../hooks/useRequireAccount';
import './SearchResultCard.css';
import { useT } from '../i18n/LanguageContext';

export default function SearchResultCard({ album, libraryStatus }) {
  const t = useT();
  const requireAccount = useRequireAccount('albums');
  const { showToast } = useToast();
  const { author, postListened, publicReviewsDefault } = useAuthor();
  const { run, pending } = useAsyncAction(() =>
    addToLibrary(author.uid, album, STATUS.LISTENED, { isPublic: publicReviewsDefault, postListened, author }),
  );
  const albumUrl = `/disco/${album.id}`;

  async function handleSave() {
    if (requireAccount()) return;
    try {
      // AGREGAR: el aviso de éxito se muestra recién cuando Firestore confirma.
      await run();
      showToast({
        type: 'success',
        message: (
          <>
            <strong>{album.name}</strong> {t('se guardó en tu biblioteca.')}
          </>
        ),
        action: { label: 'Puntuar', to: albumUrl },
      });
    } catch (error) {
      showToast({ type: 'error', message: libraryErrorMessage(error) });
    }
  }

  // Mientras espera, gana "Guardando…" aunque Firestore ya haya agregado el disco en local.
  let action;
  if (pending) {
    action = (
      <Button size="sm" block pending className="search-result-card__button">
        Guardando…
      </Button>
    );
  } else if (libraryStatus === STATUS.LISTENED) {
    action = (
      <Button to={albumUrl} variant="listened" size="sm" block className="search-result-card__button">
        <span aria-hidden="true">✓</span>
        <span className="search-result-card__state-text">{t('Escuchado')}</span>
      </Button>
    );
  } else if (libraryStatus === STATUS.PENDING) {
    action = (
      <Button to={albumUrl} variant="done" size="sm" block className="search-result-card__button">
        <span className="search-result-card__mobile-mark" aria-hidden="true">
          ✓
        </span>
        <span className="search-result-card__state-text">{t('En tu biblioteca')}</span>
      </Button>
    );
  } else {
    action = (
      <Button
        size="sm"
        block
        className="search-result-card__button"
        aria-label={t('Guardar {name} en tu biblioteca', { name: album.name })}
        onClick={handleSave}
      >
        Guardar
      </Button>
    );
  }

  return (
    <article className="search-result-card">
      <Link to={albumUrl} className="search-result-card__cover-link" tabIndex={-1} aria-hidden="true">
        <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="search-result-card__cover" />
      </Link>
      <div className="search-result-card__info">
        <h3 className="search-result-card__title">
          <Link to={albumUrl}>{album.name}</Link>
        </h3>
        <p className="search-result-card__meta">
          {album.artist}
          {album.year && ` · ${album.year}`}
        </p>
      </div>
      {action}
    </article>
  );
}
