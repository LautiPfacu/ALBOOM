// Navegación inferior, solo en celular (se oculta por CSS en pantallas anchas).

import { NavLink } from 'react-router-dom';
import './TabBar.css';

const tabClass = ({ isActive }) => `tab-bar__link${isActive ? ' tab-bar__link--active' : ''}`;

export default function TabBar() {
  return (
    <nav className="tab-bar" aria-label="Principal (celular)">
      <NavLink to="/" end className={tabClass}>
        Inicio
      </NavLink>
      <NavLink to="/explorar" className={tabClass}>
        Explorar
      </NavLink>
      <NavLink to="/comunidad" className={tabClass}>
        Comunidad
      </NavLink>
      <NavLink to="/biblioteca" className={tabClass}>
        Biblioteca
      </NavLink>
    </nav>
  );
}
