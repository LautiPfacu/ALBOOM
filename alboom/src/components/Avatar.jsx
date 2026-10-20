// Avatar redondo: foto si hay, si no la inicial sobre un color.
//   <Avatar name="Sofi" photoURL={null} size={96} display />
// Sin size, el tamaño lo define el CSS (44 px, o lo que diga className).

import { useState } from 'react';
import './Avatar.css';

// Color de fondo según la inicial, para que cada persona tenga siempre el mismo.
const COLORS = ['var(--blue)', 'var(--pink)', 'var(--yellow)', 'var(--blue-light)'];

export default function Avatar({ name = '', photoURL, size, display = false, colorful = false, className = '' }) {
  // Guardamos qué foto falló: si cambia photoURL, se vuelve a intentar.
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = photoURL === failedSrc;
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  const background = colorful ? COLORS[initial.charCodeAt(0) % COLORS.length] : 'var(--blue)';
  const lightText = background === 'var(--blue)';

  const style = { background };
  if (size) Object.assign(style, { width: size, height: size, fontSize: display ? size / 2 : size * 0.4 });

  return (
    <span className={`avatar${display ? ' avatar--display' : ''} ${className}`} style={style} aria-hidden="true">
      {photoURL && !failed ? (
        <img
          className="avatar__img"
          src={photoURL}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(photoURL)}
        />
      ) : (
        <span className={lightText ? 'avatar__initial avatar__initial--light' : 'avatar__initial'}>{initial}</span>
      )}
    </span>
  );
}
