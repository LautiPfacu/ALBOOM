// "Su promedio": el promedio de las reseñas públicas de una persona.

import { plural } from '../utils/text';
import { formatRating } from './VinylRating';
import './SideCard.css';
import './AverageCard.css';

export default function AverageCard({ average, count }) {
  if (count === 0) return null;
  return (
    <aside className="side-card" aria-labelledby="average-title">
      <h2 id="average-title" className="side-card__title">
        Su promedio
      </h2>
      <p className="average-card__value">
        <span className="average-card__number">{formatRating(Math.round(average * 10) / 10)}</span>
        <span className="side-card__text">en {plural(count, 'reseña')}</span>
      </p>
    </aside>
  );
}
