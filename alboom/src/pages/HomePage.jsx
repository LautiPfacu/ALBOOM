// Inicio: saludo, búsqueda en Spotify, "Para vos", "Tendencias" y "Lo último en tu biblioteca".

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { genreName } from '../data/genres';
import { useAlbumSearch } from '../hooks/useAlbumSearch';
import { useAlbumStats } from '../hooks/useAlbumStats';
import { useForYou } from '../hooks/useForYou';
import { useTrends } from '../hooks/useTrends';
import { STATUS } from '../services/library';
import { joinList, plural } from '../utils/text';
import AlbumTile from '../components/AlbumTile';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Loader from '../components/Loader';
import PendingCard from '../components/PendingCard';
import RecentAlbumCard from '../components/RecentAlbumCard';
import SearchBar from '../components/SearchBar';
import SearchResultCard from '../components/SearchResultCard';
import SkeletonCard from '../components/SkeletonCard';
import './HomePage.css';

const SUGGESTIONS = ['Gustavo Cerati', 'Rosalía', 'Tame Impala'];
const FIVE = [1, 2, 3, 4, 5];
const THREE = [1, 2, 3];

export default function HomePage() {
  const { displayName, profile } = useAuth();
  const { items, loading: libraryLoading, getItem } = useLibrary();
  const { query, results, status, error, hasMore, search, loadMore, reset } = useAlbumSearch();
  const [text, setText] = useState('');

  const genres = useMemo(() => profile?.genres ?? [], [profile?.genres]);
  const forYou = useForYou(genres, 5);
  const { trends } = useTrends();
  const forYouStats = useAlbumStats(forYou.albums.map((album) => album.id));

  const firstName = displayName.split(' ')[0];
  // items ya viene ordenado por addedAt desc: los primeros son los más recientes.
  const recentItems = items.slice(0, 3);
  const pendingItem = items.find((item) => item.status === STATUS.PENDING);
  const forYouReason = joinList(genres.slice(0, 3).map((id) => `el ${genreName(id).toLowerCase()}`));

  function handleSuggestion(name) {
    setText(name);
    search(name);
  }

  function handleClear() {
    setText('');
    reset();
  }

  const searching = status !== 'idle';
  const hasResults = results.length > 0;

  return (
    <div className="home page">
      <section className={`home__hero${pendingItem && !searching ? ' home__hero--with-card' : ''}`}>
        <div className="home__hero-main">
          <div className="home__greeting">
            <h1 className="home__title">
              Hola, <span className="highlight">{firstName}.</span>
            </h1>
            {!searching && (
              <p className="home__subtitle">¿Qué disco sonó hoy? Buscalo, guardalo y contá qué te pareció.</p>
            )}
          </div>

          <SearchBar value={text} onChange={setText} onSearch={search} onClear={handleClear} />

          {!searching && (
            <div className="home__suggestions">
              <span>Probá con</span>
              {SUGGESTIONS.map((name) => (
                <button key={name} type="button" className="home__chip" onClick={() => handleSuggestion(name)}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {pendingItem && !searching && (
          <div className="home__pending">
            <PendingCard item={pendingItem} />
          </div>
        )}
      </section>

      {searching && (
        <section className="home__section" aria-labelledby="results-title">
          <div className="home__section-header home__section-header--baseline">
            <h2 id="results-title" className="home__section-title">
              Resultados para «{query}»
            </h2>
            {hasResults && (
              <div className="home__legend">
                <span className="home__legend-item">
                  <span className="home__legend-swatch home__legend-swatch--listened" aria-hidden="true" />
                  Ya lo escuchaste
                </span>
                <span className="home__legend-item">
                  <span className="home__legend-swatch home__legend-swatch--saved" aria-hidden="true" />
                  En tu biblioteca
                </span>
                <span>· {plural(results.length, 'disco')}</span>
              </div>
            )}
          </div>

          {status === 'loading' && <Loader size={64} label="Buscando discos…" />}

          {hasResults && (
            <div className="home__results-grid">
              {results.map((album) => (
                <SearchResultCard key={album.id} album={album} libraryStatus={getItem(album.id)?.status} />
              ))}
            </div>
          )}

          {status === 'success' && !hasResults && (
            <EmptyState
              variant="dashed"
              title="Nada por acá"
              text={`No encontramos discos para «${query}». Revisá cómo lo escribiste o probá con el nombre del artista.`}
            />
          )}

          {/* Si falla la primera página se reintenta la búsqueda; si falla "ver más", esa página */}
          {status === 'error' && (
            <ErrorState message={error} onRetry={hasResults ? loadMore : () => search(query)} />
          )}

          {hasResults && hasMore && status !== 'error' && (
            <div className="home__more">
              <Button variant="secondary" pending={status === 'loadingMore'} onClick={loadMore}>
                {status === 'loadingMore' ? 'Cargando…' : 'Ver más resultados'}
              </Button>
            </div>
          )}
        </section>
      )}

      {!searching && genres.length > 0 && (forYou.loading || forYou.albums.length > 0) && (
        <section className="home__section" aria-labelledby="for-you-title">
          <div className="home__section-header">
            <div className="home__section-heading">
              <h2 id="for-you-title" className="home__section-title">
                Para vos
              </h2>
              {forYouReason && <p className="home__section-subtitle">Porque te gusta {forYouReason}</p>}
            </div>
            <Link to={`/explorar?genero=${genres[0]}`} className="text-link home__see-more">
              <span className="home__see-more-long">Ver más en Explorar</span>
              <span className="home__see-more-short">Ver más</span>
            </Link>
          </div>
          <div className="home__tiles">
            {forYou.loading
              ? FIVE.map((n) => <SkeletonCard key={n} />)
              : forYou.albums.map((album) => (
                  <AlbumTile
                    key={album.id}
                    album={album}
                    stats={forYouStats.get(album.id)}
                    listened={getItem(album.id)?.status === STATUS.LISTENED}
                  />
                ))}
          </div>
        </section>
      )}

      {/* Sin reseñas de la última semana, la sección no aparece */}
      {!searching && trends.length > 0 && (
        <section className="home__section" aria-labelledby="trends-title">
          <div className="home__section-header">
            <div className="home__section-heading">
              <h2 id="trends-title" className="home__section-title">
                Tendencias
              </h2>
              <p className="home__section-subtitle">Lo más reseñado esta semana en ALBOOM</p>
            </div>
          </div>
          <div className="home__tiles home__tiles--trends">
            {trends.map((trend, index) => (
              <AlbumTile
                key={trend.albumId}
                album={{ id: trend.albumId, ...trend.album }}
                subtitle={trend.album?.artist}
                stats={trend}
                rank={index + 1}
                meta={`· +${trend.count} esta semana`}
              />
            ))}
          </div>
        </section>
      )}

      {!searching && (libraryLoading || recentItems.length > 0) && (
        <section className="home__section" aria-labelledby="recent-title">
          <div className="home__section-header">
            <h2 id="recent-title" className="home__section-title">
              Lo último en tu biblioteca
            </h2>
            <Link to="/biblioteca" className="text-link">
              Ir a la biblioteca
            </Link>
          </div>
          <div className="home__recent-grid">
            {libraryLoading
              ? THREE.map((n) => <SkeletonCard key={n} layout="horizontal" />)
              : recentItems.map((item) => <RecentAlbumCard key={item.id} item={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}
