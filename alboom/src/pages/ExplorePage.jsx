// Explorar (pantalla 7): discos por género y década, con puntajes de la comunidad.
// Género, década y orden viven en la URL (?genero=tango&decada=1980&orden=puntaje):
// así sobreviven a una recarga y se pueden compartir.

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { getGenre, genreName, POPULAR_GENRE_IDS, TOTAL_GENRES } from '../data/genres';
import { useAlbumStats } from '../hooks/useAlbumStats';
import { useGenreAlbums } from '../hooks/useGenreAlbums';
import { STATUS } from '../services/library';
import AlbumTile from '../components/AlbumTile';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import GenreDialog from '../components/GenreDialog';
import Loader from '../components/Loader';
import './ExplorePage.css';

const DECADES = [
  { id: 'todas', label: 'Todas' },
  { id: '1960', label: '60' },
  { id: '1970', label: '70' },
  { id: '1980', label: '80' },
  { id: '1990', label: '90' },
  { id: '2000', label: '2000' },
  { id: '2010', label: '2010' },
  { id: '2020', label: '2020' },
];

const ORDERS = {
  resenados: 'Más reseñados',
  puntaje: 'Mejor puntaje',
  joyas: 'Joyas escondidas',
  recientes: 'Recientes',
};

// Joya escondida: pocas reseñas en ALBOOM (1 a 5) pero muy bien puntuada (4 o más).
// Así le damos visibilidad a discos que todavía casi nadie conoce.
const isHiddenGem = (stat) => stat && stat.count <= 5 && stat.average >= 4;

export default function ExplorePage() {
  const { profile } = useAuth();
  const { getItem } = useLibrary();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);

  const myGenres = useMemo(() => profile?.genres ?? [], [profile?.genres]);
  const genreParam = searchParams.get('genero');
  const genreId = getGenre(genreParam) ? genreParam : (myGenres[0] ?? 'rock-nacional');
  const decade = DECADES.some((d) => d.id === searchParams.get('decada')) ? searchParams.get('decada') : 'todas';
  const order = ORDERS[searchParams.get('orden')] ? searchParams.get('orden') : 'resenados';

  const { albums, status, error, hasMore, loadMore, retry } = useGenreAlbums(getGenre(genreId).spotify, decade);
  const stats = useAlbumStats(albums.map((album) => album.id));

  // El orden se calcula a partir de los datos (no se guarda otra lista).
  const sortedAlbums = useMemo(() => {
    const count = (album) => stats.get(album.id)?.count ?? 0;
    const average = (album) => stats.get(album.id)?.average ?? 0;
    const list = [...albums];
    if (order === 'resenados') list.sort((a, b) => count(b) - count(a));
    if (order === 'puntaje') list.sort((a, b) => average(b) - average(a) || count(b) - count(a));
    if (order === 'recientes') list.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    if (order === 'joyas') {
      // Primero las joyas; después lo que nadie reseñó todavía; al final lo más reseñado.
      const rank = (album) => {
        const stat = stats.get(album.id);
        if (isHiddenGem(stat)) return 0;
        return stat ? 2 : 1;
      };
      list.sort((a, b) => rank(a) - rank(b) || average(b) - average(a) || count(a) - count(b));
    }
    return list;
  }, [albums, stats, order]);

  // Cambia un parámetro de la URL y deja los demás como estaban.
  function updateParam(key, value) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set(key, value);
        return next;
      },
      { replace: true },
    );
  }

  function chooseGenre(id) {
    updateParam('genero', id);
    setDialogOpen(false);
  }

  const decadeLabel = decade === 'todas' ? 'todas las décadas' : `los ${DECADES.find((d) => d.id === decade).label}`;
  const otherPopular = POPULAR_GENRE_IDS.filter((id) => !myGenres.includes(id));
  // Si el género elegido no está en los chips, lo mostramos igual al principio.
  const extraGenre = ![...myGenres, ...otherPopular].includes(genreId) ? genreId : null;

  const genreChip = (id) => (
    <button key={id} type="button" className="pill" aria-pressed={id === genreId} onClick={() => chooseGenre(id)}>
      {genreName(id)}
    </button>
  );

  return (
    <div className="explore page">
      <header className="page-header">
        <h1 className="page-header__title">Explorar</h1>
        <p className="page-header__subtitle">Discos por género y década. Los puntajes son de la comunidad de ALBOOM.</p>
      </header>

      <div className="explore__genres">
        <button type="button" className="pill pill--dark explore__all-mobile" onClick={() => setDialogOpen(true)}>
          Todos <span aria-hidden="true">▾</span>
        </button>
        {extraGenre && genreChip(extraGenre)}
        {myGenres.length > 0 && (
          <>
            <span className="label-caps explore__group-label">Tus géneros</span>
            {myGenres.map(genreChip)}
            <span className="explore__divider" aria-hidden="true" />
          </>
        )}
        <span className="label-caps explore__group-label">Populares</span>
        {otherPopular.map(genreChip)}
        <button type="button" className="pill pill--dark explore__all" onClick={() => setDialogOpen(true)}>
          Todos los géneros · {TOTAL_GENRES} <span aria-hidden="true">▾</span>
        </button>
      </div>

      <div className="explore__controls">
        <div className="segmented explore__decades" role="group" aria-label="Década">
          {DECADES.map((d) => (
            <button
              key={d.id}
              type="button"
              className="segmented__option"
              aria-pressed={d.id === decade}
              onClick={() => updateParam('decada', d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
        <label className="select-field explore__decade-select">
          <span className="visually-hidden">Década</span>
          <select
            className="select-field__select"
            value={decade}
            onChange={(event) => updateParam('decada', event.target.value)}
          >
            {DECADES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id === 'todas' ? 'Todas las décadas' : `Década del ${d.label}`}
              </option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span className="select-field__label">Ordenar por</span>
          <select className="select-field__select" value={order} onChange={(event) => updateParam('orden', event.target.value)}>
            {Object.entries(ORDERS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="explore__results" aria-labelledby="explore-title">
        <div className="explore__results-header">
          <h2 id="explore-title" className="explore__results-title">
            {genreName(genreId)} · {decadeLabel}
          </h2>
          <span className="explore__legend">
            <span className="explore__legend-mark" aria-hidden="true">
              ✓
            </span>
            Ya lo escuchaste
          </span>
        </div>

        {status === 'loading' && <Loader size={64} label="Buscando discos…" />}

        {status === 'error' && albums.length === 0 && <ErrorState message={error} onRetry={retry} />}

        {status !== 'loading' && status !== 'error' && albums.length === 0 && (
          <EmptyState
            variant="dashed"
            title="Nada por acá"
            text={`No encontramos discos de ${genreName(genreId)}${decade === 'todas' ? '' : ` de ${decadeLabel}`}. ${
              decade === 'todas' ? 'Probá con otro género.' : 'Probá con otra década.'
            }`}
          >
            {decade !== 'todas' && (
              <Button variant="secondary" size="sm" onClick={() => updateParam('decada', 'todas')}>
                Ver todas las décadas
              </Button>
            )}
          </EmptyState>
        )}

        {albums.length > 0 && (
          <div className="explore__grid">
            {sortedAlbums.map((album) => (
              <AlbumTile
                key={album.id}
                album={album}
                stats={stats.get(album.id)}
                listened={getItem(album.id)?.status === STATUS.LISTENED}
              />
            ))}
          </div>
        )}

        {status === 'error' && albums.length > 0 && <ErrorState message={error} onRetry={loadMore} />}

        {hasMore && albums.length > 0 && status !== 'error' && (
          <div className="explore__more">
            <Button variant="secondary" pending={status === 'loadingMore'} onClick={loadMore}>
              {status === 'loadingMore' ? 'Cargando…' : 'Ver más discos'}
            </Button>
          </div>
        )}
      </section>

      <GenreDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialSelected={[genreId]}
        onConfirm={([id]) => chooseGenre(id)}
      />
    </div>
  );
}
