// Inicio: saludo, búsqueda en Spotify, "Para vos", "Tendencias" y "Lo último en tu biblioteca".

import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { useAlbumSearch } from '../hooks/useAlbumSearch';
import { useAlbumStats } from '../hooks/useAlbumStats';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useRequireAccount } from '../hooks/useRequireAccount';
import { useRecommendations } from '../hooks/useRecommendations';
import { useTrends } from '../hooks/useTrends';
import { STATUS } from '../services/library';
import { dismissAlbum, profileErrorMessage, undismissAlbum, updateFirstTask } from '../services/profile';
import { plural } from '../utils/text';
import AlbumTile from '../components/AlbumTile';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import FirstTaskDialog from '../components/FirstTaskDialog';
import Loader from '../components/Loader';
import PendingCard from '../components/PendingCard';
import RecentAlbumCard from '../components/RecentAlbumCard';
import SearchBar from '../components/SearchBar';
import SearchResultCard from '../components/SearchResultCard';
import SkeletonCard from '../components/SkeletonCard';
import './HomePage.css';
import { useT } from '../i18n/LanguageContext';

const PAGE_SIZE = 5; // recomendaciones visibles por vez
const FIVE = [1, 2, 3, 4, 5];
const THREE = [1, 2, 3];

export default function HomePage() {
  const t = useT();
  const requireAccount = useRequireAccount('albums');
  const { user, profile, displayName } = useAuth();
  const { showToast } = useToast();
  const { items, loading: libraryLoading, getItem } = useLibrary();
  const { query, results, status, error, hasMore, search, loadMore, reset } = useAlbumSearch();
  const [text, setText] = useState('');
  const searchRef = useRef(null);
  // Se cierra enseguida al tocar un botón, sin esperar a que Firestore confirme.
  const [firstTaskClosed, setFirstTaskClosed] = useState(false);
  const firstTaskOpen = profile?.firstTask === 'pending' && !firstTaskClosed;

  const { picks, loading: picksLoading } = useRecommendations(10);
  const [page, setPage] = useState(0);
  const { trends } = useTrends();

  // Las recomendaciones se ven de a 5; "Mostrar otras" pasa a las siguientes.
  const pageCount = Math.max(1, Math.ceil(picks.length / PAGE_SIZE));
  const currentPage = page % pageCount;
  const visiblePicks = picks.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  const pickStats = useAlbumStats(visiblePicks.map((pick) => pick.album.id));
  const dismissAction = useAsyncAction((albumId) => dismissAlbum(user.uid, albumId));

  const firstName = displayName.split(' ')[0] || 'invitado';
  // items ya viene ordenado por addedAt desc: los primeros son los más recientes.
  const recentItems = items.slice(0, 3);
  const pendingItem = items.find((item) => item.status === STATUS.PENDING);

  function answerFirstTask(firstTask) {
    setFirstTaskClosed(true);
    updateFirstTask(user.uid, firstTask).catch(() => {});
  }

  function startFirstTask() {
    answerFirstTask('started');
    // Después de que el diálogo se cierre, el foco va al buscador.
    setTimeout(() => searchRef.current?.focus(), 0);
  }

  // "No me interesa": se guarda en users/{uid}/dismissed y no se vuelve a recomendar.
  async function handleDismiss(album) {
    if (requireAccount()) return;
    try {
      await dismissAction.run(album.id);
      showToast({
        type: 'success',
        message: (
          <>
            {t('Listo, no te vamos a recomendar')} <strong>{album.name}</strong>.
          </>
        ),
        action: { label: 'Deshacer', onClick: () => undismissAlbum(user.uid, album.id).catch(() => {}) },
      });
    } catch (error) {
      showToast({ type: 'error', message: profileErrorMessage(error) });
    }
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
              {t('Hola,')} <span className="highlight">{firstName}.</span>
            </h1>
            {!searching && (
              <p className="home__subtitle">{t('¿Qué disco sonó hoy? Buscalo, guardalo y contá qué te pareció.')}</p>
            )}
          </div>

          <SearchBar ref={searchRef} value={text} onChange={setText} onSearch={search} onClear={handleClear} />
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
              {t('Resultados para «{query}»', { query })}
            </h2>
            {hasResults && (
              <div className="home__legend">
                <span className="home__legend-item">
                  <span className="home__legend-swatch home__legend-swatch--listened" aria-hidden="true" />
                  {t('Ya lo escuchaste')}
                </span>
                <span className="home__legend-item">
                  <span className="home__legend-swatch home__legend-swatch--saved" aria-hidden="true" />
                  {t('En tu biblioteca')}
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
              text={t('No encontramos discos para «{query}». Revisá cómo lo escribiste o probá con el nombre del artista.', { query })}
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

      {!searching && (picksLoading || picks.length > 0) && (
        <section className="home__section" aria-labelledby="for-you-title">
          <div className="home__section-header">
            <div className="home__section-heading">
              <h2 id="for-you-title" className="home__section-title">
                {t('Para vos')}
              </h2>
              <p className="home__section-subtitle">
                {t('Lo que te gusta, lo que recomienda la comunidad y joyas escondidas para descubrir.')}
              </p>
            </div>
            {pageCount > 1 && (
              <button type="button" className="text-link home__see-more" onClick={() => setPage((p) => p + 1)}>
                {t('Mostrar otras')}
              </button>
            )}
          </div>
          <div className="home__tiles">
            {picksLoading
              ? FIVE.map((n) => <SkeletonCard key={n} />)
              : visiblePicks.map((pick) => (
                  <AlbumTile
                    key={pick.album.id}
                    album={pick.album}
                    reason={pick.reason}
                    stats={pickStats.get(pick.album.id)}
                    onDismiss={handleDismiss}
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
                {t('Tendencias')}
              </h2>
              <p className="home__section-subtitle">{t('Lo más reseñado esta semana en ALBOOM')}</p>
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
                meta={t('· +{n} esta semana', { n: trend.count })}
              />
            ))}
          </div>
        </section>
      )}

      {!searching && (libraryLoading || recentItems.length > 0) && (
        <section className="home__section" aria-labelledby="recent-title">
          <div className="home__section-header">
            <h2 id="recent-title" className="home__section-title">
              {t('Lo último en tu biblioteca')}
            </h2>
            <Link to="/biblioteca" className="text-link">
              {t('Ir a la biblioteca')}
            </Link>
          </div>
          <div className="home__recent-grid">
            {libraryLoading
              ? THREE.map((n) => <SkeletonCard key={n} layout="horizontal" />)
              : recentItems.map((item) => <RecentAlbumCard key={item.id} item={item} />)}
          </div>
        </section>
      )}
      <FirstTaskDialog open={firstTaskOpen} onStart={startFirstTask} onSkip={() => answerFirstTask('skipped')} />
    </div>
  );
}
