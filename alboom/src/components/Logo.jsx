// Logotipo de las barras: "ALBO" + estallido animado como O + "M".
// <alboom-burst> (alboom-motion.js) late y explota en loop, y explota al pasar el mouse.
// Toma --ink, --pink y --paper, así que sigue al tema activo.

import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import './Logo.css';

export default function Logo() {
  const isMobile = useMediaQuery(MOBILE_QUERY);

  return (
    <span className="logo">
      <span aria-hidden="true">ALBO</span>
      <span className="logo__burst" aria-hidden="true">
        <alboom-burst size={isMobile ? 34 : 46} />
      </span>
      <span aria-hidden="true">M</span>
      <span className="visually-hidden">ALBOOM</span>
    </span>
  );
}
