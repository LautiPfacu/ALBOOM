// Nombre + avatar en la barra. Al tocarlo abre el menú de la cuenta:
// Perfil y ajustes · Tema (nombre actual) · Ayuda · Cerrar sesión.

import { useCallback, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { themeName } from '../data/themes';
import { logout } from '../services/auth';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useDismiss } from '../hooks/useDismiss';
import Avatar from './Avatar';
import './UserMenu.css';

export default function UserMenu() {
  const { user, profile, displayName } = useAuth();
  const { userTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();
  const { run: runLogout, pending } = useAsyncAction(logout);

  const firstName = displayName.split(' ')[0];
  const photoURL = profile?.photoURL ?? user.photoURL;

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
        <Avatar name={displayName} photoURL={photoURL} className="user-menu__avatar" />
        <span className="visually-hidden">Menú de tu cuenta</span>
      </button>

      {open && (
        <div className="user-menu__panel" id={menuId}>
          <div className="user-menu__info">
            <Avatar name={displayName} photoURL={photoURL} size={40} />
            <div className="user-menu__who">
              <span className="user-menu__full-name">{displayName}</span>
              {user.email && <span className="user-menu__email">{user.email}</span>}
            </div>
          </div>
          <Link to="/perfil" className="user-menu__item" onClick={close}>
            Perfil y ajustes
          </Link>
          <Link to="/perfil/tema" className="user-menu__item" onClick={close}>
            Tema <strong>{themeName(userTheme)}</strong>
          </Link>
          <Link to="/perfil/ayuda" className="user-menu__item" onClick={close}>
            Ayuda
          </Link>
          <button
            type="button"
            className="user-menu__item user-menu__item--logout"
            disabled={pending}
            onClick={handleLogout}
          >
            {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      )}
    </div>
  );
}
