// Cartel amarillo inclinado con el puntaje de la comunidad (al lado del título del disco).

import VinylRating, { formatRating } from './VinylRating';
import './CommunityScore.css';

export default function CommunityScore({ summary, loading }) {
  if (loading) return null;
  const hasReviews = summary.count > 0;
  const average = Math.round(summary.average * 10) / 10;

  return (
    <aside className="community-score" aria-label="Puntaje de la comunidad">
      <span className="community-score__label">Puntaje de la comunidad</span>
      {hasReviews ? (
        <>
          <div className="community-score__value">
            <span className="community-score__number">{formatRating(average)}</span>
            <span className="community-score__max">/ 5</span>
          </div>
          <div className="community-score__details">
            <VinylRating value={average} readOnly size={22} label="Promedio" />
            <span className="community-score__count">
              {summary.count === 1 ? '1 reseña' : `${summary.count} reseñas`}
            </span>
          </div>
        </>
      ) : (
        <span className="community-score__empty">Sin puntaje todavía</span>
      )}
    </aside>
  );
}
