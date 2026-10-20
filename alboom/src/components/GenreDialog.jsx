// "Todos los géneros" (pantalla 7b): buscador, familias a la izquierda y géneros como chips.
//
//   Un género (Explorar):     <GenreDialog open onClose initialSelected={['tango']} onConfirm={([id]) => …} />
//   Varios (primera vez):     <GenreDialog open multiple initialSelected={genres} onConfirm={setGenres} … />
//
// La selección es local mientras el diálogo está abierto; se aplica con el botón de abajo.

import { useId, useMemo, useState } from 'react';
import { FAMILIES, genreName, searchGenres, TOTAL_GENRES } from '../data/genres';
import { normalizeText } from '../utils/text';
import Button from './Button';
import Dialog from './Dialog';
import './GenreDialog.css';

export default function GenreDialog({ open, onClose, multiple = false, initialSelected = [], onConfirm, minimum = 0 }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="genre-dialog-title" className="genre-dialog">
      {/* El contenido se monta al abrir: así la selección arranca desde initialSelected */}
      <GenreDialogContent
        multiple={multiple}
        initialSelected={initialSelected}
        minimum={minimum}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </Dialog>
  );
}

function GenreDialogContent({ multiple, initialSelected, minimum, onClose, onConfirm }) {
  const [selected, setSelected] = useState(initialSelected);
  const [familyId, setFamilyId] = useState(
    () => FAMILIES.find((family) => family.generos.some((g) => initialSelected.includes(g.id)))?.id ?? FAMILIES[0].id,
  );
  const [search, setSearch] = useState('');
  const searchId = useId();

  const family = FAMILIES.find((f) => f.id === familyId);
  const results = useMemo(() => searchGenres(search), [search]);
  const searching = search.trim().length > 0;
  const shownGenres = searching ? results : family.generos;

  // Cuántos resultados hay en cada familia mientras se busca
  const matchesByFamily = useMemo(() => {
    if (!searching) return null;
    const needle = normalizeText(search.trim());
    return new Map(
      FAMILIES.map((f) => [f.id, f.generos.filter((g) => normalizeText(g.nombre).includes(needle)).length]),
    );
  }, [search, searching]);

  function toggle(id) {
    if (multiple) {
      setSelected((current) => (current.includes(id) ? current.filter((g) => g !== id) : [...current, id]));
    } else {
      setSelected((current) => (current[0] === id ? [] : [id]));
    }
  }

  function chooseFamily(id) {
    setFamilyId(id);
    setSearch('');
  }

  const canConfirm = selected.length >= Math.max(1, minimum);
  let confirmLabel = 'Listo';
  if (!multiple) confirmLabel = selected[0] ? `Ver discos de ${genreName(selected[0]).toLowerCase()}` : 'Elegí un género';

  return (
    <>
      <div className="genre-dialog__header">
        <div className="genre-dialog__heading">
          <h2 id="genre-dialog-title" className="genre-dialog__title">
            Todos los géneros
          </h2>
          <p className="genre-dialog__subtitle">
            {TOTAL_GENRES} géneros en {FAMILIES.length} familias.{' '}
            {multiple ? 'Elegí los que te gustan.' : 'Elegí uno para ver sus discos.'}
          </p>
        </div>
        <button type="button" className="genre-dialog__close" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="genre-dialog__search">
        <label htmlFor={searchId} className="visually-hidden">
          Buscá un género
        </label>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <input
          id={searchId}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscá un género: chamamé, shoegaze, dembow…"
          autoComplete="off"
        />
      </div>

      <div className="genre-dialog__body">
        <nav className="genre-dialog__families" aria-label="Familias de géneros">
          {FAMILIES.map((f) => {
            const count = matchesByFamily ? matchesByFamily.get(f.id) : f.generos.length;
            return (
              <button
                key={f.id}
                type="button"
                className="genre-dialog__family"
                aria-pressed={!searching && f.id === familyId}
                disabled={searching && count === 0}
                onClick={() => chooseFamily(f.id)}
              >
                <span>{f.nombre}</span>
                <span className="genre-dialog__family-count">{count}</span>
              </button>
            );
          })}
        </nav>

        <div className="genre-dialog__genres">
          <div className="genre-dialog__genres-heading">
            <h3 className="genre-dialog__family-title">{searching ? `Resultados para «${search.trim()}»` : family.nombre}</h3>
            <span className="genre-dialog__family-total">
              {shownGenres.length === 1 ? '1 género' : `${shownGenres.length} géneros`}
            </span>
          </div>
          {shownGenres.length === 0 ? (
            <p className="genre-dialog__empty">No encontramos ese género. Probá con otra palabra.</p>
          ) : (
            <div className="genre-dialog__chips">
              {shownGenres.map((genre) => {
                const active = selected.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    type="button"
                    className="genre-dialog__chip"
                    aria-pressed={active}
                    onClick={() => toggle(genre.id)}
                  >
                    {active && <span aria-hidden="true">✓ </span>}
                    {genre.nombre}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="genre-dialog__footer">
        <span className="genre-dialog__chosen">
          {selected.length === 0 ? (
            'Todavía no elegiste ninguno'
          ) : (
            <>
              Elegiste:{' '}
              <span className="highlight">
                {multiple ? `${selected.length} ${selected.length === 1 ? 'género' : 'géneros'}` : genreName(selected[0])}
              </span>
            </>
          )}
        </span>
        <div className="genre-dialog__footer-actions">
          {selected.length > 0 && (
            <button type="button" className="text-link" onClick={() => setSelected([])}>
              Limpiar
            </button>
          )}
          <Button disabled={!canConfirm} onClick={() => onConfirm(selected)}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
