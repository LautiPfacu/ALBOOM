// Botón de biblioteca de un posteo, con los tres estados de siempre:
//   "+ Guardar" · "En tu biblioteca" (pendiente, amarillo) · "✓ Escuchado" (verde)

import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useAuthor } from '../hooks/useAuthor';
import { useT } from '../i18n/LanguageContext';
import { addToLibrary, libraryErrorMessage, STATUS } from '../services/library';
import Button from './Button';
import { useRequireAccount } from '../hooks/useRequireAccount';

export default function LibraryButton({ album }) {
  const requireAccount = useRequireAccount('albums');
  const { getItem } = useLibrary();
  const { showToast } = useToast();
  const t = useT();
  const { author, postListened, publicReviewsDefault } = useAuthor();
  const albumId = album.albumId ?? album.id;
  const status = getItem(albumId)?.status;
  const { run, pending } = useAsyncAction(() =>
    addToLibrary(author.uid, { ...album, id: albumId }, STATUS.LISTENED, {
      isPublic: publicReviewsDefault,
      postListened,
      author,
    }),
  );

  async function handleSave() {
    if (requireAccount()) return;
    try {
      await run();
      showToast({
        type: 'success',
        message: (
          <>
            <strong>{album.name}</strong> {t('se guardó en tu biblioteca.')}
          </>
        ),
        action: { label: 'Puntuar', to: `/disco/${albumId}` },
      });
    } catch (error) {
      showToast({ type: 'error', message: libraryErrorMessage(error) });
    }
  }

  if (pending) {
    return (
      <Button size="sm" pending>
        Guardando…
      </Button>
    );
  }
  if (status === STATUS.LISTENED) {
    return (
      <Button to={`/disco/${albumId}`} variant="listened" size="sm">
        ✓ Escuchado
      </Button>
    );
  }
  if (status === STATUS.PENDING) {
    return (
      <Button to={`/disco/${albumId}`} variant="done" size="sm">
        En tu biblioteca
      </Button>
    );
  }
  return (
    <Button variant="secondary" size="sm" aria-label={t('Guardar {name} en tu biblioteca', { name: album.name })} onClick={handleSave}>
      + Guardar
    </Button>
  );
}
