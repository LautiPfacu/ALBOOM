// Puntaje corto: un vinilo chico + el número ("4,5").
//   label: cómo lo lee un lector de pantalla ("Tu puntaje", "Promedio de la comunidad")

import { formatRating } from './VinylRating';
import { useT } from '../i18n/LanguageContext';
import './MiniRating.css';

export default function MiniRating({ value, size = 18, label = 'Tu puntaje', children }) {
  const t = useT();
  return (
    <span className="mini-rating">
      <span className="mini-rating__vinyl" style={{ width: size, height: size }} aria-hidden="true" />
      <span className="visually-hidden">{t(label)}:</span>
      <span>{formatRating(value)}</span>
      {children}
    </span>
  );
}
