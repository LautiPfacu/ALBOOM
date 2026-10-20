// "Cómo lo puntuaron": 10 barras, de ½ a 5 vinilos.

import { formatRating } from './VinylRating';
import './RatingChart.css';

const MAX_BAR_HEIGHT = 92;

// "La mayoría le dio entre 4 y 4,5.": busca el par de barras vecinas con más reseñas.
function summaryText(distribution, count) {
  if (count === 1) return 'Por ahora hay una sola reseña.';
  let best = 0;
  for (let i = 1; i < distribution.length - 1; i += 1) {
    if (distribution[i] + distribution[i + 1] > distribution[best] + distribution[best + 1]) best = i;
  }
  const from = (best + 1) / 2;
  const to = (best + 2) / 2;
  if (distribution[best + 1] === 0) return `La mayoría le dio ${formatRating(from)}.`;
  if (distribution[best] === 0) return `La mayoría le dio ${formatRating(to)}.`;
  return `La mayoría le dio entre ${formatRating(from)} y ${formatRating(to)}.`;
}

export default function RatingChart({ distribution, count, compact = false }) {
  const max = Math.max(...distribution, 1);

  return (
    <figure className={`rating-chart${compact ? ' rating-chart--compact' : ''}`}>
      <figcaption className="rating-chart__label">Cómo lo puntuaron</figcaption>
      <div className="rating-chart__bars" aria-hidden="true">
        {distribution.map((value, index) => (
          <div
            // La key es el puntaje de la barra (0,5 … 5): estable y único.
            key={(index + 1) / 2}
            className="rating-chart__bar"
            style={{ height: `${Math.max(4, (value / max) * MAX_BAR_HEIGHT)}px` }}
            title={`${formatRating((index + 1) / 2)}: ${value}`}
          />
        ))}
      </div>
      <div className="rating-chart__axis" aria-hidden="true">
        <span>½</span>
        <span>5</span>
      </div>
      <p className="rating-chart__text">{summaryText(distribution, count)}</p>
      {/* Versión en texto para lectores de pantalla */}
      <ul className="visually-hidden">
        {distribution.map((value, index) => (
          <li key={(index + 1) / 2}>
            {formatRating((index + 1) / 2)} vinilos: {value === 1 ? '1 reseña' : `${value} reseñas`}
          </li>
        ))}
      </ul>
    </figure>
  );
}
