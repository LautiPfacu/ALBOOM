import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';
import UserMenu from './UserMenu';
import './Navbar.css';

// NavLink le pasa isActive a className: así marcamos el link de la página actual.
const linkClass = ({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`;

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="page navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="ALBOOM, ir al inicio">
          <Logo />
        </Link>
        <nav className="navbar__nav" aria-label="Principal">
          <NavLink to="/" end className={linkClass}>
            Inicio
          </NavLink>
          <NavLink to="/explorar" className={linkClass}>
            Explorar
          </NavLink>
          <NavLink to="/biblioteca" className={linkClass}>
            Biblioteca
          </NavLink>
        </nav>
        <UserMenu />
      </div>
    </header>
  );
}
