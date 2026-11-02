import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';
import UserMenu from './UserMenu';
import './Navbar.css';
import { useT } from '../i18n/LanguageContext';

// NavLink le pasa isActive a className: así marcamos el link de la página actual.
const linkClass = ({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`;

export default function Navbar() {
  const t = useT();
  return (
    <header className="navbar">
      <div className="page navbar__inner">
        <Link to="/" className="navbar__logo" aria-label={t('ALBOOM, ir al inicio')}>
          <Logo />
        </Link>
        <nav className="navbar__nav" aria-label={t('Principal')}>
          <NavLink to="/" end className={linkClass}>
            {t('Inicio')}
          </NavLink>
          <NavLink to="/explorar" className={linkClass}>
            {t('Explorar')}
          </NavLink>
          <NavLink to="/comunidad" className={linkClass}>
            {t('Comunidad')}
          </NavLink>
          <NavLink to="/biblioteca" className={linkClass}>
            {t('Biblioteca')}
          </NavLink>
          <NavLink to="/perfil" className={linkClass}>
            {t('Perfil')}
          </NavLink>
        </nav>
        <UserMenu />
      </div>
    </header>
  );
}
