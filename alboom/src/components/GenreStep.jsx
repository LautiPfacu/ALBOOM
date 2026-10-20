// Primera vez, paso 1 (pantalla 2): "¿Qué música te mueve?" — mínimo 3 géneros.

import { useId, useMemo, useState } from 'react';
import { genreName, MIN_GENRES, ONBOARDING_GENRES, searchGenres, TOTAL_GENRES } from '../data/genres';
import Button from './Button';
import GenreDialog from './GenreDialog';
import GenreTile from './GenreTile';
import OnboardingFooter from './OnboardingFooter';
import './GenreStep.css';

const SEARCH_LIMIT = 12;

export default function GenreStep({ selected, onChange, onNext }) {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const searchId = useId();

  const results = useMemo(() => searchGenres(search).slice(0, SEARCH_LIMIT), [search]);
  const tileIds = ONBOARDING_GENRES.map((genre) => genre.id);
  // Elegidos desde el buscador o "Ver todos" que no están entre las 12 tarjetas
  const extraSelected = selected.filter((id) => !tileIds.includes(id));
  const missing = Math.max(0, MIN_GENRES - selected.length);

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id]);
  }

  return (
    <>
      <main className="genre-step page">
        <div className="onboarding__intro">
          <h1 className="onboarding__title">
            ¿Qué música te <span className="highlight">mueve?</span>
          </h1>
          <p className="onboarding__subtitle">
            Elegí al menos 3 géneros.
            <span className="onboarding__subtitle-long">
              {' '}
              Con esto armamos tus recomendaciones y el color de tu ALBOOM.
            </span>
          </p>
        </div>

        <div className="genre-step__search">
          <div className="genre-step__search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <label htmlFor={searchId} className="visually-hidden">
              Buscar un género
            </label>
            <input
              id={searchId}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`¿No está tu género? Buscalo entre los ${TOTAL_GENRES}`}
              autoComplete="off"
            />
            <button type="button" className="text-link genre-step__all" onClick={() => setDialogOpen(true)}>
              Ver todos
            </button>
          </div>

          {search.trim() && (
            <div className="genre-step__results" aria-live="polite">
              {results.length === 0 ? (
                <p className="genre-step__empty">No encontramos ese género. Probá con «Ver todos».</p>
              ) : (
                results.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    className="pill"
                    aria-pressed={selected.includes(genre.id)}
                    onClick={() => toggle(genre.id)}
                  >
                    {selected.includes(genre.id) && <span aria-hidden="true">✓</span>}
                    {genre.nombre}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="genre-step__grid">
          {ONBOARDING_GENRES.map((genre) => (
            <GenreTile
              key={genre.id}
              label={genre.label}
              selected={selected.includes(genre.id)}
              onToggle={() => toggle(genre.id)}
            />
          ))}
        </div>

        {extraSelected.length > 0 && (
          <div className="genre-step__extra">
            <span className="label-caps">También elegiste</span>
            {extraSelected.map((id) => (
              <button
                key={id}
                type="button"
                className="pill"
                aria-pressed="true"
                aria-label={`Quitar ${genreName(id)}`}
                onClick={() => toggle(id)}
              >
                {genreName(id)} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}
      </main>

      <OnboardingFooter
        start={
          missing > 0 ? (
            <span className="genre-step__missing" role="status">
              Elegí {missing} {missing === 1 ? 'género' : 'géneros'} más para seguir.
            </span>
          ) : (
            <span role="status">
              <span className="highlight">{selected.length} elegidos</span>
              <span className="genre-step__more"> · podés sumar más</span>
            </span>
          )
        }
      >
        <Button size="lg" disabled={missing > 0} onClick={onNext}>
          Siguiente
        </Button>
      </OnboardingFooter>

      <GenreDialog
        open={dialogOpen}
        multiple
        initialSelected={selected}
        onClose={() => setDialogOpen(false)}
        onConfirm={(ids) => {
          onChange(ids);
          setDialogOpen(false);
        }}
      />
    </>
  );
}
