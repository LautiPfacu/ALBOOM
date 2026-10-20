// Tarjeta "fantasma" mientras cargan los datos. Es decorativa: el texto de carga va aparte.
//   layout: 'vertical' (portada arriba, para grillas) | 'horizontal' (portada a la izquierda)

import './SkeletonCard.css';

export default function SkeletonCard({ layout = 'vertical' }) {
  return (
    <div className={`skeleton-card skeleton-card--${layout}`} aria-hidden="true">
      <div className="skeleton-card__cover" />
      <div className="skeleton-card__lines">
        <div className="skeleton-card__bar skeleton-card__bar--title" />
        <div className="skeleton-card__bar skeleton-card__bar--sub" />
      </div>
    </div>
  );
}
