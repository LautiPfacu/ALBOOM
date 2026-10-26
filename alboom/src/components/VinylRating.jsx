// Puntaje con 5 vinilos, de a medio punto.
//
//   <VinylRating value={4.5} readOnly size={16} />                 → solo muestra
//   <VinylRating value={rating} onChange={setRating} size={44} />  → editable
//
// Editable: mitad izquierda de un vinilo = x,5 · mitad derecha = x · tocar el puntaje actual lo borra (0).
// Teclado: flechas suben o bajan de a 0,5; Inicio = 0; Fin = 5.

import { useState } from 'react';
import { useT } from '../i18n/LanguageContext';
import { getLanguage } from '../i18n/language';
import './VinylRating.css';

const POSITIONS = [1, 2, 3, 4, 5];

// eslint-disable-next-line react-refresh/only-export-components
export function formatRating(value) {
  return value.toLocaleString(getLanguage() === 'en' ? 'en-US' : 'es-AR', { maximumFractionDigits: 1 });
}

function fillFor(value, position) {
  if (value >= position) return 'full';
  if (value >= position - 0.5) return 'half';
  return 'empty';
}

export default function VinylRating({
  value = 0,
  onChange,
  readOnly = false,
  disabled = false,
  size = 40,
  label = 'Tu puntaje',
}) {
  const [preview, setPreview] = useState(null);
  const t = useT();
  const interactive = !readOnly && typeof onChange === 'function';
  const enabled = interactive && !disabled;
  const shown = enabled && preview !== null ? preview : value;
  const valueText = value > 0 ? t('{n} de 5', { n: formatRating(value) }) : t('Sin puntaje');

  function choose(next) {
    if (!enabled) return;
    setPreview(null);
    onChange(next === value ? 0 : next);
  }

  function handleKeyDown(event) {
    if (!enabled) return;
    const nextByKey = {
      ArrowRight: Math.min(5, value + 0.5),
      ArrowUp: Math.min(5, value + 0.5),
      ArrowLeft: Math.max(0, value - 0.5),
      ArrowDown: Math.max(0, value - 0.5),
      Home: 0,
      End: 5,
    };
    if (!(event.key in nextByKey)) return;
    event.preventDefault();
    if (nextByKey[event.key] !== value) onChange(nextByKey[event.key]);
  }

  return (
    <div
      className={`vinyl-rating${interactive ? ' vinyl-rating--interactive' : ''}`}
      style={{ '--vinyl-size': `${size}px` }}
      role={interactive ? 'slider' : 'img'}
      aria-label={interactive ? t(label) : `${t(label)}: ${valueText}`}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 5 : undefined}
      aria-valuenow={interactive ? value : undefined}
      aria-valuetext={interactive ? valueText : undefined}
      aria-disabled={interactive && disabled ? true : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setPreview(null)}
    >
      {POSITIONS.map((position) => (
        <span key={position} className={`vinyl vinyl--${fillFor(shown, position)}`}>
          {interactive && (
            <>
              <span
                className="vinyl__hit vinyl__hit--left"
                onMouseEnter={() => enabled && setPreview(position - 0.5)}
                onClick={() => choose(position - 0.5)}
              />
              <span
                className="vinyl__hit vinyl__hit--right"
                onMouseEnter={() => enabled && setPreview(position)}
                onClick={() => choose(position)}
              />
            </>
          )}
        </span>
      ))}
    </div>
  );
}
