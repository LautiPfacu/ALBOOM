// Menú "Compartir" de un posteo: Compartir en tu muro (repost) · Copiar link · Compartir en otra app.

import { useCallback, useId, useRef, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useDismiss } from '../hooks/useDismiss';
import './ShareMenu.css';

export default function ShareMenu({ count, reposted, pending, onRepost, url, title }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, containerRef);
  const canShareNative = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function copyLink() {
    close();
    try {
      await navigator.clipboard.writeText(url);
      showToast({ type: 'success', message: 'Copiamos el link.' });
    } catch {
      showToast({ type: 'error', message: 'No pudimos copiar el link.' });
    }
  }

  async function shareNative() {
    close();
    try {
      await navigator.share({ title, url });
    } catch {
      // Si la persona cierra el menú del sistema, no es un error.
    }
  }

  return (
    <div className="share-menu" ref={containerRef}>
      <button
        type="button"
        className="post-action"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={pending}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 2l4 4-4 4" />
          <path d="M3 11V9a3 3 0 0 1 3-3h15" />
          <path d="M7 22l-4-4 4-4" />
          <path d="M21 13v2a3 3 0 0 1-3 3H3" />
        </svg>
        Compartir · {count}
      </button>
      {open && (
        <div className="share-menu__panel" id={menuId}>
          <button
            type="button"
            className="share-menu__item share-menu__item--main"
            onClick={() => {
              close();
              onRepost();
            }}
          >
            {reposted ? 'Dejar de compartir' : 'Compartir en tu muro'}
          </button>
          <button type="button" className="share-menu__item" onClick={copyLink}>
            Copiar link
          </button>
          {canShareNative && (
            <button type="button" className="share-menu__item" onClick={shareNative}>
              Compartir en otra app
            </button>
          )}
        </div>
      )}
    </div>
  );
}
