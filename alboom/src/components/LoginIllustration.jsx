// Panel decorativo del login: la explosión de historieta + el cartel "Escuchá. / Puntuá. / Descubrí."
// Es solo decoración: aria-hidden y alt vacío.

import explosionUrl from '../assets/login-explosion.svg';
import './LoginIllustration.css';

export default function LoginIllustration() {
  return (
    <div className="login-illustration" aria-hidden="true">
      <img className="login-illustration__art" src={explosionUrl} alt="" />
      <div className="login-illustration__dots" />
      <div className="login-illustration__motto">
        <span>Escuchá.</span>
        <span className="login-illustration__motto-line--yellow">Puntuá.</span>
        <span>Descubrí.</span>
      </div>
    </div>
  );
}
