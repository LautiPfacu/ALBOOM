// Reseña del disco: textarea controlado, contador, "Mostrar en la comunidad" y "Guardar reseña".
//
// El borrador arranca con lo que dice Firestore (savedReview). Si ese valor cambia (por ejemplo,
// desde otra pestaña) y la persona no tiene cambios sin guardar, el borrador se actualiza solo.

import { useId, useState } from 'react';
import { REVIEW_MAX_LENGTH } from '../services/library';
import Button from './Button';
import './ReviewForm.css';

export default function ReviewForm({
  savedReview,
  isPublic,
  saving,
  togglingPublic,
  onSave,
  onTogglePublic,
  onRemove,
}) {
  const [draft, setDraft] = useState(savedReview);
  const [base, setBase] = useState(savedReview); // valor de Firestore del que salió el borrador
  const textareaId = useId();
  const counterId = useId();

  // "Ajustar estado cuando cambia una prop" (patrón de la doc de React): sin useEffect.
  if (savedReview !== base) {
    setBase(savedReview);
    if (draft === base) setDraft(savedReview);
  }

  const unchanged = draft.trim() === savedReview.trim();

  function handleSubmit(event) {
    event.preventDefault();
    if (!unchanged) onSave(draft);
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <label htmlFor={textareaId} className="review-form__label">
        Tu reseña
      </label>
      <textarea
        id={textareaId}
        className="review-form__textarea"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        maxLength={REVIEW_MAX_LENGTH}
        placeholder="¿Qué te pareció?"
        aria-describedby={counterId}
      />
      <div className="review-form__footer">
        <div className="review-form__left">
          <label className="review-form__public">
            <input
              type="checkbox"
              className="review-form__checkbox"
              checked={isPublic}
              disabled={togglingPublic}
              onChange={(event) => onTogglePublic(event.target.checked)}
            />
            <span className="review-form__box" aria-hidden="true">
              ✓
            </span>
            Mostrar en la comunidad
          </label>
          <span id={counterId} className="review-form__counter">
            {draft.length} / {REVIEW_MAX_LENGTH}
          </span>
        </div>
        <div className="review-form__actions">
          <button type="button" className="text-link" onClick={onRemove}>
            Quitar de la biblioteca
          </button>
          <Button type="submit" pending={saving} disabled={unchanged}>
            {saving ? 'Guardando…' : 'Guardar reseña'}
          </Button>
        </div>
      </div>
    </form>
  );
}
