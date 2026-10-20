// Logotipo de las barras: "ALBO" + estallido como O + "M".

import BurstMark from './BurstMark';
import './Logo.css';

export default function Logo() {
  return (
    <span className="logo">
      <span aria-hidden="true">ALBO</span>
      <BurstMark className="logo__burst" />
      <span aria-hidden="true">M</span>
      <span className="visually-hidden">ALBOOM</span>
    </span>
  );
}
