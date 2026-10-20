// "Te quedó pendiente": el último disco que la persona guardó para escuchar después.
// "Ya lo escuché" lo pasa a escuchado (y pone la fecha de escucha).

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { libraryErrorMessage, saveListening, STATUS } from '../services/library';
import AlbumCover from './AlbumCover';
import Button from './Button';
import './PendingCard.css';

export default function PendingCard({ item }) {
  const { user, profile, displayName } = useAuth();
  const { showToast } = useToast();
  const author = { username: profile?.username, displayName, photoURL: profile?.photoURL ?? null };
  const { run, pending } = useAsyncAction(() =>
    saveListening(user.uid, item, { status: STATUS.LISTENED }, author),
  );

  async function handleListened() {
    try {
      await run();
      showToast({
        type: 'success',
        message: (
          <>
            Marcaste <strong>{item.name}</strong> como escuchado.
          </>
        ),
        action: { label: 'Puntuar', to: `/disco/${item.id}` },
      });
    } catch (error) {
      showToast({ type: 'error', message: libraryErrorMessage(error) });
    }
  }

  return (
    <aside className="pending-card" aria-label="Te quedó pendiente">
      <div className="pending-card__tape" aria-hidden="true" />
      <Link to={`/disco/${item.id}`} className="pending-card__cover-link" tabIndex={-1} aria-hidden="true">
        <AlbumCover src={item.cover} name={item.name} artist={item.artist} className="pending-card__cover" />
      </Link>
      <div className="pending-card__info">
        <span className="label-caps pending-card__label">Te quedó pendiente</span>
        <Link to={`/disco/${item.id}`} className="pending-card__title">
          {item.name}
        </Link>
        <span className="pending-card__meta">{[item.artist, item.year].filter(Boolean).join(' · ')}</span>
        <Button size="sm" pending={pending} className="pending-card__button" onClick={handleListened}>
          {pending ? 'Guardando…' : 'Ya lo escuché'}
        </Button>
      </div>
    </aside>
  );
}
