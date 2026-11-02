// Navegación inferior, solo en celular (se oculta por CSS en pantallas anchas).

import { NavLink } from 'react-router-dom';
import './TabBar.css';
import { useT } from '../i18n/LanguageContext';

const tabClass = ({ isActive }) => `tab-bar__link${isActive ? ' tab-bar__link--active' : ''}`;

export default function TabBar() {
  const t = useT();
  return (
    <nav className="tab-bar" aria-label={t('Principal (celular)')}>
      <NavLink to="/" end className={tabClass}>
        {t('Inicio')}
      </NavLink>
      <NavLink to="/explorar" className={tabClass}>
        {t('Explorar')}
      </NavLink>
      <NavLink to="/comunidad" className={tabClass}>
        {t('Comunidad')}
      </NavLink>
      <NavLink to="/biblioteca" className={tabClass}>
        {t('Biblioteca')}
      </NavLink>
      <NavLink to="/perfil" className={tabClass}>
        {t('Perfil')}
      </NavLink>
    </nav>
  );
}
