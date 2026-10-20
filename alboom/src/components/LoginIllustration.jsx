// Panel decorativo del login: la explosión animada + el cartel "Escuchá. / Puntuá. / Descubrí."
// Es solo decoración: aria-hidden.
// <alboom-explosion> (alboom-motion.js) llena su contenedor y se pausa sola fuera de pantalla,
// con la pestaña oculta o con "reducir movimiento".

import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import './LoginIllustration.css';

// En celular encuadramos el centro de la explosión en la franja de 250 px.
const MOBILE_VIEWBOX = '68 140 624 400';
const DESKTOP_VIEWBOX = '0 0 760 800';

export default function LoginIllustration() {
  const isMobile = useMediaQuery(MOBILE_QUERY);

  return (
    <div className="login-illustration" aria-hidden="true">
      <div className="login-illustration__art">
        <alboom-explosion viewbox={isMobile ? MOBILE_VIEWBOX : DESKTOP_VIEWBOX} />
      </div>
      <div className="login-illustration__dots" />
      <div className="login-illustration__motto">
        <span>Escuchá.</span>
        <span className="login-illustration__motto-line--yellow">Puntuá.</span>
        <span>Descubrí.</span>
      </div>
    </div>
  );
}
