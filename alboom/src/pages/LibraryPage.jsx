// Biblioteca: filtros por estado, orden, 3 vistas y quitar con confirmación.
// Filtro y orden van en la URL (?estado=pendiente&orden=puntaje) para que sobrevivan a una recarga.
// La vista elegida se guarda en localStorage (preferencia de esta persona en este navegador).

import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { libraryErrorMessage, removeFromLibrary, STATUS } from '../services/library';
import { formatRating } from '../components/VinylRating';
import { plural } from '../utils/text';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LibraryCard from '../components/LibraryCard';
import LibraryCardSmall from '../components/LibraryCardSmall';
import LibraryRow from '../components/LibraryRow';
import Loader from '../components/Loader';
import ViewSwitcher from '../components/ViewSwitcher';
import './LibraryPage.css';

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: STATUS.LISTENED, label: 'Escuchados' },
  { id: STATUS.PENDING, label: 'Pendientes' },
];

const ORDERS = {
  recientes: 'Recientes',
  puntaje: 'Mejor puntaje',
  az: 'A–Z',
};

const VIEW_KEY = 'alboom:libraryView';
const LIBRARY_VIEWS = ['grande', 'chica', 'lista'];

// localStorage puede fallar (modo privado, permisos): en ese caso usamos la vista grande.
function readSavedView() {
  try {
    const saved = localStorage.getItem(VIEW_KEY);
    return LIBRARY_VIEWS.includes(saved) ? saved : 'grande';
  } catch {
    return 'grande';
  }
}

export default function LibraryPage() {
  const { user } = useAuth();
  const { items, loading, error } = useLibrary();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState(readSavedView);
  const [toRemove, setToRemove] = useState(null);
  const { run: runRemove, pending: removing } = useAsyncAction((albumId) => removeFromLibrary(user.uid, albumId));

  const filter = FILTERS.some((f) => f.id === searchParams.get('estado')) ? searchParams.get('estado') : 'todos';
  const order = ORDERS[searchParams.get('orden')] ? searchParams.get('orden') : 'recientes';

  // Contadores y promedio: se derivan de items, no se guardan aparte.
  const counts = useMemo(
    () => ({
      todos: items.length,
      [STATUS.LISTENED]: items.filter((item) => item.status === STATUS.LISTENED).length,
      [STATUS.PENDING]: items.filter((item) => item.status === STATUS.PENDING).length,
    }),
    [items],
  );

  const average = useMemo(() => {
    const rated = items.filter((item) => item.rating > 0);
    return rated.length ? rated.reduce((sum, item) => sum + item.rating, 0) / rated.length : 0;
  }, [items]);

  const visibleItems = useMemo(() => {
    const filtered = filter === 'todos' ? items : items.filter((item) => item.status === filter);
    const list = [...filtered]; // items ya viene por fecha (más reciente primero)
    if (order === 'puntaje') list.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name, 'es'));
    if (order === 'az') list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return list;
  }, [items, filter, order]);

  function updateParam(key, value, defaultValue) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === defaultValue) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  }

  function changeView(nextView) {
    setView(nextView);
    try {
      localStorage.setItem(VIEW_KEY, nextView);
    } catch {
      // Sin localStorage la vista igual cambia, solo que no se recuerda.
    }
  }

  async function confirmRemove() {
    try {
      // ELIMINAR: el aviso aparece cuando Firestore confirma el borrado.
      await runRemove(toRemove.id);
      showToast({ type: 'success', message: `Quitaste ${toRemove.name} de tu biblioteca.` });
      setToRemove(null);
    } catch (removeError) {
      // Si falla, el diálogo queda abierto para reintentar.
      showToast({ type: 'error', message: libraryErrorMessage(removeError) });
    }
  }

  const averageText = average > 0 ? formatRating(Math.round(average * 10) / 10) : null;

  let content;
  if (loading) {
    content = <Loader size={64} label="Cargando tu biblioteca…" />;
  } else if (error) {
    content = <ErrorState message={error} onRetry={() => navigate(0)} />;
  } else if (items.length === 0) {
    content = (
      <EmptyState title="Tu biblioteca está vacía" text="Buscá un disco y tocá Guardar.">
        <Button to="/" size="sm">
          Buscar discos
        </Button>
      </EmptyState>
    );
  } else if (visibleItems.length === 0) {
    content = (
      <EmptyState
        title={filter === STATUS.LISTENED ? 'Todavía no tenés discos escuchados.' : 'No tenés discos pendientes.'}
      >
        <Button variant="secondary" size="sm" onClick={() => updateParam('estado', 'todos', 'todos')}>
          Ver todos
        </Button>
      </EmptyState>
    );
  } else if (view === 'lista') {
    content = (
      <div className="library__table" role="table" aria-label="Tus discos">
        <div className="library__table-head" role="row">
          <span role="columnheader">
            <span className="visually-hidden">Portada</span>
          </span>
          <span role="columnheader">Disco</span>
          <span role="columnheader" className="library__col-rating">
            Tu puntaje
          </span>
          <span role="columnheader">Estado</span>
          <span role="columnheader" className="library__col-date">
            Lo escuchaste
          </span>
          <span role="columnheader">
            <span className="visually-hidden">Opciones</span>
          </span>
        </div>
        {visibleItems.map((item) => (
          <LibraryRow key={item.id} item={item} onRemove={setToRemove} />
        ))}
      </div>
    );
  } else if (view === 'chica') {
    content = (
      <div className="library__grid library__grid--small">
        {visibleItems.map((item) => (
          <LibraryCardSmall key={item.id} item={item} />
        ))}
      </div>
    );
  } else {
    content = (
      <div className="library__grid">
        {visibleItems.map((item) => (
          <LibraryCard key={item.id} item={item} onRemove={setToRemove} />
        ))}
      </div>
    );
  }

  return (
    <div className="library page">
      <header className="library__header">
        <div className="page-header library__heading">
          <h1 className="page-header__title">Tu biblioteca</h1>
          {!loading && (
            <p className="library__count">
              <span className="library__count-long">
                {plural(items.length, 'disco guardado', 'discos guardados')}
                {averageText && ` · tu promedio es ${averageText}`}
              </span>
              <span className="library__count-short">
                {plural(items.length, 'disco')}
                {averageText && ` · promedio ${averageText}`}
              </span>
            </p>
          )}
        </div>
        <div className="library__tools">
          <ViewSwitcher value={view} onChange={changeView} />
          <label className="select-field library__order">
            <span className="select-field__label">Ordenar por</span>
            <select
              className="select-field__select"
              value={order}
              onChange={(event) => updateParam('orden', event.target.value, 'recientes')}
            >
              {Object.entries(ORDERS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="library__filters scroll-row" role="group" aria-label="Filtrar por estado">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="pill"
            aria-pressed={filter === f.id}
            onClick={() => updateParam('estado', f.id, 'todos')}
          >
            {f.label} · {counts[f.id]}
          </button>
        ))}
      </div>

      {content}

      <ConfirmDialog
        open={toRemove !== null}
        title={`¿Quitar ${toRemove?.name ?? ''} de tu biblioteca?`}
        text="Se borran tu puntaje y tu reseña. No se puede deshacer."
        confirmLabel="Quitar"
        pendingLabel="Quitando…"
        pending={removing}
        onConfirm={confirmRemove}
        onCancel={() => setToRemove(null)}
      />
    </div>
  );
}
