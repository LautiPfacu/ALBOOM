// "Tu escucha": estado, puntaje y reseña del disco en tu biblioteca.
//
//   item === null → todavía no está guardado: botones "Ya lo escuché" y "Para escuchar después".
//   item          → StatusToggle + puntaje con vinilos + reseña (si está escuchado).
// Todo lo que se ve sale de Firestore (item): si una escritura falla, el valor vuelve solo.

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { addToLibrary, isPublishable, libraryErrorMessage, saveListening, STATUS } from '../services/library';
import Button from './Button';
import ReviewForm from './ReviewForm';
import StatusToggle from './StatusToggle';
import VinylRating, { formatRating } from './VinylRating';
import './ListeningCard.css';

export default function ListeningCard({ album, item, onRemove }) {
  const { user, profile, displayName } = useAuth();
  const { showToast } = useToast();
  const uid = user.uid;
  const author = { username: profile?.username ?? '', displayName, photoURL: profile?.photoURL ?? null };
  const defaultPublic = profile?.settings?.publicReviewsDefault ?? true;

  // Una acción por cada cosa que se guarda, así cada una tiene su propio "Guardando…".
  const [savingAs, setSavingAs] = useState(null);
  const addAction = useAsyncAction((status) => addToLibrary(uid, album, status, { isPublic: defaultPublic }));
  const statusAction = useAsyncAction((status) => saveListening(uid, item, { status }, author));
  const ratingAction = useAsyncAction((rating) => saveListening(uid, item, { rating }, author));
  const reviewAction = useAsyncAction((review) => saveListening(uid, item, { review }, author));
  const publicAction = useAsyncAction((isPublic) => saveListening(uid, item, { isPublic }, author));

  // "Guardado ✓" durante 2 segundos después de puntuar.
  const [ratingSaved, setRatingSaved] = useState(false);
  const savedTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(savedTimerRef.current), []);

  async function handleAdd(status) {
    setSavingAs(status);
    try {
      await addAction.run(status);
      showToast({
        type: 'success',
        message: (
          <>
            <strong>{album.name}</strong> se guardó en tu biblioteca.
          </>
        ),
      });
    } catch (error) {
      showToast({ type: 'error', message: libraryErrorMessage(error) });
    }
  }

  async function handleStatus(status) {
    try {
      await statusAction.run(status);
    } catch (error) {
      showToast({ type: 'error', message: libraryErrorMessage(error) });
    }
  }

  async function handleRating(rating) {
    clearTimeout(savedTimerRef.current);
    setRatingSaved(false);
    try {
      // MODIFICAR: "Guardado ✓" aparece recién cuando Firestore confirma.
      await ratingAction.run(rating);
      setRatingSaved(true);
      savedTimerRef.current = setTimeout(() => setRatingSaved(false), 2000);
    } catch (error) {
      showToast({ type: 'error', message: libraryErrorMessage(error) });
    }
  }

  async function handleReview(review) {
    try {
      const result = await reviewAction.run(review);
      showToast({
        type: 'success',
        message: result?.published ? 'Tu reseña ya se ve en la comunidad.' : 'Reseña guardada.',
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: item.isPublic ? 'No pudimos publicar tu reseña. Probá de nuevo.' : libraryErrorMessage(error),
        action: { label: 'Reintentar', onClick: () => handleReview(review) },
      });
    }
  }

  async function handleTogglePublic(isPublic) {
    try {
      const result = await publicAction.run(isPublic);
      if (result?.published) showToast({ type: 'success', message: 'Tu reseña ya se ve en la comunidad.' });
      else if (result?.wasPublished) showToast({ type: 'success', message: 'Tu reseña ya no se ve en la comunidad.' });
    } catch (error) {
      showToast({ type: 'error', message: libraryErrorMessage(error) });
    }
  }

  if (!item) {
    return (
      <section id="tu-escucha" className="listening-card" aria-labelledby="listening-title">
        <h2 id="listening-title" className="listening-card__title">
          Tu escucha
        </h2>
        <p className="listening-card__text">Guardalo para puntuarlo y escribir tu reseña.</p>
        <div className="listening-card__add">
          <Button
            pending={addAction.pending && savingAs === STATUS.LISTENED}
            disabled={addAction.pending}
            onClick={() => handleAdd(STATUS.LISTENED)}
          >
            {addAction.pending && savingAs === STATUS.LISTENED ? 'Guardando…' : 'Ya lo escuché'}
          </Button>
          <Button
            variant="secondary"
            pending={addAction.pending && savingAs === STATUS.PENDING}
            disabled={addAction.pending}
            onClick={() => handleAdd(STATUS.PENDING)}
          >
            {addAction.pending && savingAs === STATUS.PENDING ? 'Guardando…' : 'Para escuchar después'}
          </Button>
        </div>
      </section>
    );
  }

  const isPending = item.status === STATUS.PENDING;
  const publishHint = item.isPublic && !isPublishable(item) && item.rating === 0;

  return (
    <section id="tu-escucha" className="listening-card" aria-labelledby="listening-title">
      <div className="listening-card__top">
        <h2 id="listening-title" className="listening-card__title">
          Tu escucha
        </h2>
        <StatusToggle value={item.status} onChange={handleStatus} disabled={statusAction.pending} />
      </div>

      {isPending ? (
        <p className="listening-card__text">Marcalo como escuchado para puntuarlo y reseñarlo.</p>
      ) : (
        <>
          <div className="listening-card__rating">
            <div className="listening-card__rating-head">
              <span className="listening-card__label">Tu puntaje</span>
              {/* role="status": el lector de pantalla anuncia "Guardando…" y "Guardado ✓" */}
              <span className="listening-card__saved" role="status">
                {ratingAction.pending && <span className="listening-card__saving">Guardando…</span>}
                {!ratingAction.pending && ratingSaved && <span className="highlight">Guardado ✓</span>}
              </span>
            </div>
            <div className="listening-card__vinyls">
              <VinylRating
                value={item.rating}
                onChange={handleRating}
                disabled={ratingAction.pending}
                size={44}
              />
              <span className="listening-card__number" aria-hidden="true">
                {item.rating > 0 ? formatRating(item.rating) : '—'}
              </span>
            </div>
            <p className="listening-card__help">
              Tocá la mitad izquierda de un vinilo para medio punto. Tocá el mismo puntaje para borrarlo.
            </p>
          </div>

          <ReviewForm
            savedReview={item.review ?? ''}
            isPublic={Boolean(item.isPublic)}
            saving={reviewAction.pending}
            togglingPublic={publicAction.pending}
            onSave={handleReview}
            onTogglePublic={handleTogglePublic}
            onRemove={onRemove}
          />
          {publishHint && <p className="listening-card__help">Tu reseña se publica cuando le pongas puntaje.</p>}
        </>
      )}

      {isPending && (
        <button type="button" className="text-link listening-card__remove" onClick={onRemove}>
          Quitar de la biblioteca
        </button>
      )}
    </section>
  );
}
