// Una reseña de la comunidad: avatar, nombre, hace cuánto, puntaje y texto.

import { timeAgo } from '../utils/text';
import Avatar from './Avatar';
import VinylRating from './VinylRating';
import './ReviewCard.css';

export default function ReviewCard({ review, isMine = false }) {
  const name = review.displayName || review.username || 'Alguien';

  return (
    <article className="review-card">
      <div className="review-card__head">
        <Avatar name={name} photoURL={review.photoURL} size={36} colorful />
        <div className="review-card__who">
          <span className="review-card__name">
            {name}
            {isMine && <span className="review-card__mine"> · vos</span>}
          </span>
          <span className="review-card__time">{timeAgo(review.createdAt)}</span>
        </div>
        <VinylRating value={review.rating} readOnly size={16} label={`Puntaje de ${name}`} />
      </div>
      {review.text ? (
        <p className="review-card__text">{review.text}</p>
      ) : (
        <p className="review-card__text review-card__text--empty">Solo puntaje, sin texto.</p>
      )}
    </article>
  );
}
