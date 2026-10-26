// Botón con el estilo "sello" de ALBOOM.
//
//   <Button onClick={save}>Guardar</Button>
//   <Button variant="secondary" size="sm">Cancelar</Button>
//   <Button to="/">Volver al inicio</Button>       → se dibuja como <Link>
//
// variant: 'primary' (acento) | 'secondary' (card) | 'danger' (rojo) | 'done' (amarillo, sin sombra)
//          | 'listened' (verde, sin sombra)
// size: 'sm' (40 px) | 'md' (46 px) | 'lg' (54 px)

import { Link } from 'react-router-dom';
import { useT } from '../i18n/LanguageContext';
import './Button.css';

export default function Button({
  children,
  to,
  type = 'button',
  variant = 'primary',
  size = 'md',
  block = false,
  pending = false,
  disabled = false,
  className = '',
  ...rest
}) {
  const t = useT();
  // Si el texto del botón es un string, lo traducimos acá (así cada botón no tiene que hacerlo).
  const content = typeof children === 'string' ? t(children) : children;
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    block && 'btn--block',
    pending && 'btn--pending',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || pending} aria-busy={pending || undefined} {...rest}>
      {/* Mientras espera: logo animado chico a la izquierda del texto */}
      {pending && (
        <alboom-loader size={20} shadow="var(--card)" hole="var(--pink-pressed)" aria-hidden="true" />
      )}
      {content}
    </button>
  );
}
