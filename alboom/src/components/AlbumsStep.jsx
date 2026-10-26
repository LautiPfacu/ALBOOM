// Primera vez, paso 2 (pantalla 3): "¿Qué escuchaste últimamente?" — hasta 5 discos.
// Los discos elegidos se guardan en la biblioteca como escuchados al tocar "Siguiente".

import { useState } from 'react';
import { useAlbumSearch } from '../hooks/useAlbumSearch';
import { useForYou } from '../hooks/useForYou';
import AlbumCover from './AlbumCover';
import Button from './Button';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import Loader from './Loader';
import OnboardingFooter from './OnboardingFooter';
import SearchBar from './SearchBar';
import { useT } from '../i18n/LanguageContext';
import './AlbumsStep.css';

const MAX_PICKS = 5;

export default function AlbumsStep({ genres, picks, onChange, onBack, onNext, saving, error }) {
  const t = useT();
  const [text, setText] = useState('');
  const { query, results, status, error: searchError, search, reset } = useAlbumSearch();
  const suggestions = useForYou(genres, 6);

  const searching = status !== 'idle';
  const albums = searching ? results : suggestions.albums;
  const full = picks.length >= MAX_PICKS;
  const isPicked = (id) => picks.some((album) => album.id === id);

  function toggle(album) {
    if (isPicked(album.id)) onChange(picks.filter((a) => a.id !== album.id));
    else if (!full) onChange([...picks, album]);
  }

  return (
    <>
      <main className="albums-step page">
        <div className="albums-step__main">
          <div className="onboarding__intro">
            <h1 className="onboarding__title onboarding__title--md">{t('¿Qué escuchaste últimamente?')}</h1>
            <p className="onboarding__subtitle">
              {t('Sumá hasta 5 discos. Van a tu biblioteca como escuchados y nos ayudan a recomendarte.')}
            </p>
          </div>

          <SearchBar
            value={text}
            onChange={setText}
            onSearch={search}
            onClear={() => {
              setText('');
              reset();
            }}
          />

          <section className="albums-step__list" aria-labelledby="albums-step-title">
            <h2 id="albums-step-title" className="label-caps">
              {searching ? t('Resultados para «{query}»', { query }) : t('Sugerencias por tus géneros')}
            </h2>

            {(status === 'loading' || (!searching && suggestions.loading)) && (
              <Loader size={56} label="Buscando discos…" />
            )}
            {status === 'error' && <ErrorState message={searchError} onRetry={() => search(query)} />}
            {status === 'success' && results.length === 0 && (
              <EmptyState variant="dashed" title="Nada por acá" text={t('No encontramos discos para «{query}».', { query })} />
            )}

            {albums.length > 0 && (
              <div className="albums-step__grid">
                {albums.slice(0, 12).map((album) => {
                  const picked = isPicked(album.id);
                  return (
                    <article key={album.id} className="albums-step__album">
                      <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="albums-step__cover" />
                      <span className="albums-step__name">{album.name}</span>
                      <span className="albums-step__artist">{album.artist}</span>
                      <button
                        type="button"
                        className="albums-step__add"
                        aria-pressed={picked}
                        disabled={!picked && full}
                        onClick={() => toggle(album)}
                      >
                        {t(picked ? '✓ Sumado' : '+ Sumar')}
                        <span className="visually-hidden"> {album.name}</span>
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="albums-step__picks" aria-labelledby="picks-title">
          <div className="albums-step__picks-head">
            <h2 id="picks-title" className="albums-step__picks-title">
              {t('Tus discos')}
            </h2>
            <span className="albums-step__picks-count">
              {t('{n} de {total}', { n: picks.length, total: MAX_PICKS })}
            </span>
          </div>
          {picks.map((album) => (
            <div key={album.id} className="albums-step__pick">
              <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="albums-step__pick-cover" />
              <div className="albums-step__pick-info">
                <span className="albums-step__pick-name">{album.name}</span>
                <span className="albums-step__pick-artist">{album.artist}</span>
              </div>
              <button
                type="button"
                className="albums-step__remove"
                aria-label={t('Sacar {name}', { name: album.name })}
                onClick={() => toggle(album)}
              >
                ×
              </button>
            </div>
          ))}
          {!full && (
            <div className="albums-step__slots">
              {MAX_PICKS - picks.length === 1
                ? t('Te queda 1 lugar')
                : t('Te quedan {n} lugares', { n: MAX_PICKS - picks.length })}
            </div>
          )}
        </aside>
      </main>

      <OnboardingFooter
        start={
          <Button variant="secondary" size="md" onClick={onBack} disabled={saving}>
            ← Atrás
          </Button>
        }
      >
        {error && (
          <span className="albums-step__error" role="alert">
            {t(error)}
          </span>
        )}
        <button type="button" className="text-link albums-step__skip" onClick={() => onNext([])} disabled={saving}>
          {t('Saltear este paso')}
        </button>
        <Button size="lg" pending={saving} onClick={() => onNext(picks)}>
          {saving ? 'Guardando…' : 'Siguiente'}
        </Button>
      </OnboardingFooter>
    </>
  );
}
