// Pop-up "Editar Top 5".
//   - 5 lugares en fila. Se reordenan arrastrando (Pointer Events: mouse, dedo o lápiz)
//     o con teclado: Enter/Espacio "agarra" un disco, las flechas lo mueven, Enter/Espacio lo suelta.
//   - × saca un disco. Abajo se busca en tu biblioteca o en Spotify.
//   - "Avisar a mis seguidores" publica "actualizó su Top 5" en la comunidad.

import { useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { useAlbumSearch } from '../hooks/useAlbumSearch';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useAuthor } from '../hooks/useAuthor';
import { albumSummary, saveTop5, TOP5_SIZE } from '../services/publicProfile';
import { writeErrorMessage } from '../services/writes';
import { normalizeText } from '../utils/text';
import AlbumCover from './AlbumCover';
import Button from './Button';
import Dialog from './Dialog';
import Loader from './Loader';
import { useT } from '../i18n/LanguageContext';
import './TopFiveShelf.css';
import './TopFiveDialog.css';

export default function TopFiveDialog({ open, onClose, initial }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="top-five-dialog-title" className="dialog--wide top-five-dialog">
      <TopFiveEditor initial={initial} onClose={onClose} />
    </Dialog>
  );
}

// Mueve el elemento de la posición `from` a la posición `to`.
function move(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function TopFiveEditor({ initial, onClose }) {
  const { user } = useAuth();
  const t = useT();
  const { items } = useLibrary();
  const { showToast } = useToast();
  const { author } = useAuthor();
  const [slots, setSlots] = useState(() => initial.map(albumSummary));
  const [source, setSource] = useState('library'); // 'library' | 'spotify'
  const [text, setText] = useState('');
  const [notify, setNotify] = useState(true);
  const [grabbed, setGrabbed] = useState(null); // índice "agarrado" con teclado
  const [dragging, setDragging] = useState(null); // índice que se arrastra con el puntero
  const [announcement, setAnnouncement] = useState('');
  const rowRef = useRef(null);
  const search = useAlbumSearch();
  const saveAction = useAsyncAction(() => saveTop5(user.uid, slots, { notify, author }));

  const chosenIds = useMemo(() => new Set(slots.map((album) => album.albumId)), [slots]);
  const full = slots.length >= TOP5_SIZE;

  // Opciones de abajo: tu biblioteca filtrada por texto, o resultados de Spotify.
  const libraryOptions = useMemo(() => {
    const needle = normalizeText(text.trim());
    return items
      .filter((item) => !needle || normalizeText(`${item.name} ${item.artist}`).includes(needle))
      .slice(0, 12)
      .map((item) => ({ ...albumSummary(item), albumId: item.id }));
  }, [items, text]);
  const options = source === 'library' ? libraryOptions : search.results.map(albumSummary);

  function add(album) {
    if (full || chosenIds.has(album.albumId)) return;
    setSlots((current) => [...current, album]);
    setAnnouncement(t('{name} agregado en el puesto {n}.', { name: album.name, n: slots.length + 1 }));
  }

  function remove(index) {
    setAnnouncement(t('{name} salió de tu Top 5.', { name: slots[index].name }));
    setSlots((current) => current.filter((_, i) => i !== index));
    setGrabbed(null);
  }

  // ---------- Teclado ----------
  function handleSlotKeyDown(event, index) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (grabbed === null) {
        setGrabbed(index);
        setAnnouncement(t('{name} agarrado. Usá las flechas para moverlo y Enter para soltarlo.', { name: slots[index].name }));
      } else {
        setGrabbed(null);
        setAnnouncement(t('{name} quedó en el puesto {n}.', { name: slots[index].name, n: index + 1 }));
      }
      return;
    }
    if (grabbed === null) return;
    const delta = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[event.key];
    if (event.key === 'Escape') {
      event.stopPropagation(); // que Escape suelte el disco y no cierre el pop-up
      setGrabbed(null);
      return;
    }
    if (!delta) return;
    event.preventDefault();
    const target = index + delta;
    if (target < 0 || target >= slots.length) return;
    setSlots((current) => move(current, index, target));
    setGrabbed(target);
    setAnnouncement(t('{name}, ahora en el puesto {n}.', { name: slots[index].name, n: target + 1 }));
    // El foco sigue solo al disco: como cada lugar tiene key estable (albumId),
    // React mueve el mismo botón en lugar de crear uno nuevo.
  }

  // ---------- Puntero (mouse, dedo, lápiz) ----------
  // Calculamos sobre qué lugar está el puntero a partir del ancho de la fila (5 lugares iguales).
  function slotUnderPointer(clientX) {
    const rect = rowRef.current.getBoundingClientRect();
    const index = Math.floor(((clientX - rect.left) / rect.width) * TOP5_SIZE);
    return Math.max(0, Math.min(slots.length - 1, index));
  }

  function handlePointerDown(event, index) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId); // seguimos recibiendo el movimiento aunque salga
    setDragging(index);
  }

  function handlePointerMove(event) {
    if (dragging === null) return;
    const target = slotUnderPointer(event.clientX);
    if (target !== dragging) {
      setSlots((current) => move(current, dragging, target));
      setDragging(target);
    }
  }

  function handlePointerUp() {
    if (dragging !== null) setAnnouncement(t('{name} quedó en el puesto {n}.', { name: slots[dragging].name, n: dragging + 1 }));
    setDragging(null);
  }

  async function handleSave() {
    try {
      await saveAction.run();
      showToast({ type: 'success', message: notify ? t('Guardaste tu Top 5 y avisamos a tus seguidores.') : t('Guardaste tu Top 5.') });
      onClose();
    } catch (error) {
      showToast({ type: 'error', message: writeErrorMessage(error) });
    }
  }

  return (
    <>
      <div className="dialog__header">
        <div className="dialog__heading">
          <h2 id="top-five-dialog-title" className="dialog__title">
            {t('Tu Top 5')}
          </h2>
          <p className="dialog__text">{t('Los cinco discos que más te representan. Arrastrá para cambiar el orden.')}</p>
        </div>
        <button type="button" className="dialog__close" aria-label={t('Cerrar')} onClick={onClose}>
          ×
        </button>
      </div>

      {/* Anuncios para lectores de pantalla al mover discos */}
      <p className="visually-hidden" aria-live="assertive">
        {announcement}
      </p>

      <ol className="top-five-editor__row" ref={rowRef} aria-label={t('Tu Top 5 (en orden)')}>
        {Array.from({ length: TOP5_SIZE }, (_, index) => {
          const album = slots[index];
          if (!album) {
            return (
              <li key={`libre-${index + 1}`} className="top-five-editor__slot top-five-editor__slot--empty">
                <span className="top-five__number" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="top-five-editor__free">
                  <span aria-hidden="true">+</span>
                  {t('Elegí un disco de abajo')}
                </span>
              </li>
            );
          }
          const isMoving = grabbed === index || dragging === index;
          return (
            <li
              key={album.albumId}
              className={`top-five-editor__slot${isMoving ? ' top-five-editor__slot--moving' : ''}`}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <span className="top-five__number" aria-hidden="true">
                {index + 1}
              </span>
              <button
                type="button"
                className="top-five-editor__handle"
                aria-pressed={grabbed === index}
                aria-label={t('{name}, puesto {n}. Enter para mover.', { name: album.name, n: index + 1 })}
                onKeyDown={(event) => handleSlotKeyDown(event, index)}
                onPointerDown={(event) => handlePointerDown(event, index)}
              >
                <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="top-five-editor__cover" />
                <span className="top-five-editor__grip" aria-hidden="true">
                  ⠿
                </span>
              </button>
              <button
                type="button"
                className="top-five-editor__remove"
                aria-label={t('Sacar {name} de tu Top 5', { name: album.name })}
                onClick={() => remove(index)}
              >
                ×
              </button>
              <span className="top-five-editor__name">{album.name}</span>
            </li>
          );
        })}
      </ol>

      <div className="top-five-editor__search">
        <form
          className="top-five-editor__search-box"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            if (source === 'spotify' && text.trim().length >= 2) search.search(text);
          }}
        >
          <label htmlFor="top-five-search" className="visually-hidden">
            {t('Buscá un disco')}
          </label>
          <input
            id="top-five-search"
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={source === 'library' ? t('Buscá en tu biblioteca') : t('Buscá en Spotify y apretá Enter')}
            autoComplete="off"
          />
        </form>
        <div className="segmented" role="group" aria-label={t('Dónde buscar')}>
          <button type="button" className="segmented__option" aria-pressed={source === 'library'} onClick={() => setSource('library')}>
            {t('De tu biblioteca')}
          </button>
          <button type="button" className="segmented__option" aria-pressed={source === 'spotify'} onClick={() => setSource('spotify')}>
            {t('Buscar en Spotify')}
          </button>
        </div>
      </div>

      {source === 'spotify' && search.status === 'loading' && <Loader size={40} label="Buscando discos…" />}
      {source === 'spotify' && search.status === 'error' && <p className="dialog__error">{t(search.error)}</p>}
      {options.length === 0 && !(source === 'spotify' && search.status === 'loading') && (
        <p className="dialog__text">
          {source === 'library' ? t('No hay discos de tu biblioteca con ese nombre.') : t('Escribí un disco o artista y apretá Enter.')}
        </p>
      )}
      <ul className="top-five-editor__options">
        {options.map((album) => {
          const chosen = chosenIds.has(album.albumId);
          return (
            <li key={album.albumId} className="top-five-editor__option">
              <AlbumCover src={album.cover} name={album.name} artist={album.artist} />
              <span className="top-five-editor__option-name">{album.name}</span>
              <button
                type="button"
                className={`btn btn--sm ${chosen ? 'btn--done' : 'btn--secondary'}`}
                disabled={chosen || full}
                onClick={() => add(album)}
              >
                {chosen ? t('En tu Top 5') : t('Agregar')}
                <span className="visually-hidden"> {album.name}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="top-five-editor__footer">
        <div className="top-five-editor__notify">
          <button
            type="button"
            role="switch"
            className="switch"
            aria-checked={notify}
            aria-labelledby="notify-label"
            onClick={() => setNotify((value) => !value)}
          />
          <span>
            <span id="notify-label" className="top-five-editor__notify-title">
              {t('Avisar a mis seguidores')}
            </span>
            <span className="dialog__text">{t('Publica «actualizó su Top 5» en la comunidad.')}</span>
          </span>
        </div>
        <div className="dialog__actions">
          <button type="button" className="text-link" onClick={onClose} disabled={saveAction.pending}>
            {t('Cancelar')}
          </button>
          <Button pending={saveAction.pending} onClick={handleSave}>
            {saveAction.pending ? 'Guardando…' : 'Guardar Top 5'}
          </Button>
        </div>
      </div>
    </>
  );
}
