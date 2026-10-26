// Nombre + avatar en la barra. Al tocarlo abre el menú de la cuenta:
// Tu perfil · Perfil y ajustes · Tema (nombre actual) · Idioma · Ayuda · Cerrar sesión.
// Un invitado ve: Crear cuenta / Iniciar sesión · Idioma · Salir.

import { useCallback, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { themeName } from '../data/themes';
import { logout } from '../services/auth';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useDismiss } from '../hooks/useDismiss';
import { photoFor } from '../services/profile';
import { useT } from '../i18n/LanguageContext';
import Avatar from './Avatar';
import LanguageSwitcher from './LanguageSwitcher';
import './UserMenu.css';

export default function UserMenu() {
  const { user, profile, displayName, isGuest } = useAuth();
  const t = useT();
  const { userTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();
  const { run: runLogout, pending } = useAsyncAction(logout);

  const name = isGuest ? t('Invitado') : displayName;
  const firstName = name.split(' ')[0];
  const photoURL = photoFor(profile, user);

  const close = useCallback(() => setOpen(false), []);
  // Con el menú abierto, Escape o un clic afuera lo cierran.
  useDismiss(open, close, containerRef);

  async function handleLogout() {
    try {
      await runLogout();
      navigate('/login', { replace: true });
    } catch {
      showToast({ type: 'error', message: 'No pudimos cerrar la sesión. Probá de nuevo.' });
    }
  }

  return (
    <div className="user-menu" ref={containerRef}>
      <button
        type="button"
        className="user-menu__trigger"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="user-menu__name">{firstName}</span>
        <Avatar name={name} photoURL={photoURL} className="user-menu__avatar" />
        <span className="visually-hidden">{t('Menú de tu cuenta')}</span>
      </button>

      {open && (
        <div className="user-menu__panel" id={menuId}>
          <div className="user-menu__info">
            <Avatar name={name} photoURL={photoURL} size={40} />
            <div className="user-menu__who">
              <span className="user-menu__full-name">{name}</span>
              {user.email && <span className="user-menu__email">{user.email}</span>}
            </div>
          </div>
          {isGuest ? (
            <Link to="/login" state={{ mode: 'register' }} className="user-menu__item" onClick={close}>
              {t('Crear cuenta / Iniciar sesión')}
            </Link>
          ) : (
            <>
              <Link to="/perfil" className="user-menu__item" onClick={close}>
                {t('Tu perfil')}
              </Link>
              <Link to="/ajustes" className="user-menu__item" onClick={close}>
                {t('Perfil y ajustes')}
              </Link>
              <Link to="/ajustes/tema" className="user-menu__item" onClick={close}>
                {t('Tema')} <strong>{t(themeName(userTheme))}</strong>
              </Link>
              <Link to="/ajustes/ayuda" className="user-menu__item" onClick={close}>
                {t('Ayuda')}
              </Link>
            </>
          )}
          <div className="user-menu__language">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            className="user-menu__item user-menu__item--logout"
            disabled={pending}
            onClick={handleLogout}
          >
            {t(pending ? 'Cerrando sesión…' : isGuest ? 'Salir' : 'Cerrar sesión')}
          </button>
        </div>
      )}
    </div>
  );
}
