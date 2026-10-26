// "Lo que dice la comunidad": distribución de puntajes y reseñas (3 + "Ver las N reseñas").

import { useMemo, useState } from 'react';
import { useT } from '../i18n/LanguageContext';
import Button from './Button';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import Loader from './Loader';
import RatingChart from './RatingChart';
import ReviewCard from './ReviewCard';
import './CommunitySection.css';

const FIRST_REVIEWS = 3;
const millis = (value) => (typeof value?.toMillis === 'function' ? value.toMillis() : 0);

export default function CommunitySection({ reviews, summary, loading, error, myUid }) {
  const [order, setOrder] = useState('recientes');
  const [showAll, setShowAll] = useState(false);
  const t = useT();

  const sorted = useMemo(() => {
    const list = [...reviews];
    if (order === 'recientes') list.sort((a, b) => millis(b.createdAt) - millis(a.createdAt));
    else list.sort((a, b) => b.rating - a.rating || millis(b.createdAt) - millis(a.createdAt));
    return list;
  }, [reviews, order]);

  const visible = showAll ? sorted : sorted.slice(0, FIRST_REVIEWS);

  return (
    <section className="community" aria-labelledby="community-title">
      <div className="community__header">
        <h2 id="community-title" className="community__title">
          {t('Lo que dice la comunidad')}
        </h2>
        {reviews.length > 1 && (
          <div className="community__order" role="group" aria-label={t('Ordenar reseñas')}>
            {[
              ['recientes', 'Recientes'],
              ['puntaje', 'Mejor puntaje'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className="community__order-option"
                aria-pressed={order === id}
                onClick={() => setOrder(id)}
              >
                {t(label)}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <Loader size={48} label="Cargando reseñas…" />}
      {error && <ErrorState message={error} />}

      {!loading && !error && reviews.length === 0 && (
        <EmptyState
          variant="dashed"
          title="Silencio total"
          text="Todavía nadie reseñó este disco. Podés ser la primera persona."
        >
          {/* Link al ancla de "Tu escucha": sin manipular el DOM */}
          <a href="#tu-escucha" className="btn btn--primary btn--sm">
            {t('Escribir reseña')}
          </a>
        </EmptyState>
      )}

      {!loading && reviews.length > 0 && (
        <div className="community__body">
          <RatingChart distribution={summary.distribution} count={summary.count} />
          <div className="community__reviews">
            {visible.map((review) => (
              <ReviewCard key={review.id} review={review} isMine={review.uid === myUid} />
            ))}
            {reviews.length > FIRST_REVIEWS && (
              <Button variant="secondary" className="community__all" onClick={() => setShowAll((value) => !value)}>
                {showAll ? 'Ver menos' : t('Ver las {n} reseñas', { n: reviews.length })}
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
