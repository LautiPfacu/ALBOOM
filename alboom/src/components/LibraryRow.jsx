// Disco de la biblioteca en vista "Lista" (pantalla 8c).
// Columnas: tapa · disco · tu puntaje · estado · lo escuchaste · ⋯ (menú con "Ver disco" y "Quitar").

import { useCallback, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDismiss } from '../hooks/useDismiss';
import { useT } from '../i18n/LanguageContext';
import { STATUS } from '../services/library';
import { formatDate } from '../utils/text';
import AlbumCover from './AlbumCover';
import StatusChip from './StatusChip';
import VinylRating from './VinylRating';
import './LibraryRow.css';

export default function LibraryRow({ item, onRemove }) {
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuId = useId();
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useDismiss(menuOpen, closeMenu, menuRef);

  const albumUrl = `/disco/${item.id}`;
  const isPending = item.status === STATUS.PENDING;
  const listenedDate = item.listenedAt ? formatDate(item.listenedAt) : '';

  let rating;
  if (isPending) rating = <span className="library-row__muted">—</span>;
  else if (item.rating === 0) rating = <span className="library-row__muted">{t('Sin puntaje')}</span>;
  else rating = <VinylRating value={item.rating} readOnly size={16} />;

  return (
    <div className="library-row" role="row">
      <div role="cell" className="library-row__cover-cell">
        <Link to={albumUrl} tabIndex={-1} aria-hidden="true">
          <AlbumCover src={item.cover} name={item.name} artist={item.artist} className="library-row__cover" />
        </Link>
      </div>
      <div role="cell" className="library-row__album">
        <Link to={albumUrl} className="library-row__title">
          {item.name}
        </Link>
        <span className="library-row__meta">{[item.artist, item.year].filter(Boolean).join(' · ')}</span>
      </div>
      <div role="cell" className="library-row__rating">
        {rating}
      </div>
      <div role="cell" className="library-row__status">
        <StatusChip status={item.status} />
      </div>
      <div role="cell" className="library-row__date">
        {/* Si es pendiente o no tiene fecha (discos guardados antes de V2): "Todavía no" */}
        {isPending || !listenedDate ? t('Todavía no') : listenedDate}
      </div>
      <div role="cell" className="library-row__menu" ref={menuRef}>
        <button
          type="button"
          className="library-row__menu-button"
          aria-label={t('Más opciones para {name}', { name: item.name })}
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          onClick={() => setMenuOpen((open) => !open)}
        >
          ⋯
        </button>
        {menuOpen && (
          <div className="library-row__menu-panel" id={menuId}>
            <Link to={albumUrl} className="library-row__menu-item">
              {t('Ver disco')}
            </Link>
            <button
              type="button"
              className="library-row__menu-item"
              onClick={() => {
                closeMenu();
                onRemove(item);
              }}
            >
              {t('Quitar de la biblioteca')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
