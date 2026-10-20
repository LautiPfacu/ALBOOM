// Estado vacío: título, texto y una acción opcional.
//   variant: 'card' (caja con borde e ilustración) | 'dashed' (caja punteada, para "sin resultados")

import './EmptyState.css';

export default function EmptyState({ title, text, children, variant = 'card' }) {
  return (
    <div className={`empty-state empty-state--${variant}`}>
      {variant === 'card' && (
        <div className="empty-state__illustration" aria-hidden="true">
          Ilustración
        </div>
      )}
      <h2 className="empty-state__title">{title}</h2>
      {text && <p className="empty-state__text">{text}</p>}
      {children}
    </div>
  );
}
