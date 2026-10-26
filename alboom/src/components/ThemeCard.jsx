// Tarjeta para elegir un tema: vista previa + nombre + géneros + marca de elegido.
// Es un botón con aria-pressed (se comporta como una opción de un grupo).

import ThemePreview from './ThemePreview';
import './ThemeCard.css';
import { useT } from '../i18n/LanguageContext';

export default function ThemeCard({ theme, selected, onSelect, badge, size = 'large', name, disabled = false }) {
  const t = useT();
  return (
    <button
      type="button"
      className={`theme-card theme-card--${size}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(theme.id)}
    >
      <ThemePreview themeId={theme.id} size={size} name={name} />
      <span className="theme-card__row">
        <span className="theme-card__text">
          <span className="theme-card__name">{t(theme.name)}</span>
          <span className="theme-card__tags">{theme.tags}</span>
        </span>
        <span className="theme-card__radio" aria-hidden="true" />
      </span>
      {size === 'large' && <span className="theme-card__description">{t(theme.description)}</span>}
      {badge && <span className="chip chip--pending theme-card__badge">{badge}</span>}
    </button>
  );
}
