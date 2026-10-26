// Una reseña de la comunidad: avatar, nombre, hace cuánto, puntaje y texto.

import { Link } from 'react-router-dom';
import { timeAgo } from '../utils/text';
import { useT } from '../i18n/LanguageContext';
import Avatar from './Avatar';
import VinylRating from './VinylRating';
import './ReviewCard.css';

export default function ReviewCard({ review, isMine = false }) {
  const t = useT();
  const name = review.displayName || review.username || t('Alguien');

  return (
    <article className="review-card">
      <div className="review-card__head">
        {/* Nombre y avatar llevan al perfil de la persona (si tiene usuario) */}
        {review.username ? (
          <Link to={`/u/${review.username}`} tabIndex={-1} aria-hidden="true">
            <Avatar name={name} photoURL={review.photoURL} size={36} colorful />
          </Link>
        ) : (
          <Avatar name={name} photoURL={review.photoURL} size={36} colorful />
        )}
        <div className="review-card__who">
          <span className="review-card__name">
            {review.username ? (
              <Link to={`/u/${review.username}`} className="review-card__link">
                {name}
              </Link>
            ) : (
              name
            )}
            {isMine && <span className="review-card__mine"> · {t('vos')}</span>}
          </span>
          <span className="review-card__time">{timeAgo(review.createdAt)}</span>
        </div>
        <VinylRating value={review.rating} readOnly size={16} label={t('Puntaje de {name}', { name })} />
      </div>
      {review.text ? (
        <p className="review-card__text">{review.text}</p>
      ) : (
        <p className="review-card__text review-card__text--empty">{t('Solo puntaje, sin texto.')}</p>
      )}
    </article>
  );
}
