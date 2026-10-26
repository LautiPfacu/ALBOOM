// Primera vez, paso 1: "Elegí al menos 1 género".
// Sin géneros precargados: un buscador, un botón grande "Ver todos" y, abajo,
// las tarjetas de los géneros que la persona va eligiendo.

import { useId, useMemo, useState } from 'react';
import { genreName, MIN_GENRES, searchGenres, TOTAL_GENRES } from '../data/genres';
import { useT } from '../i18n/LanguageContext';
import Button from './Button';
import GenreDialog from './GenreDialog';
import GenreTile from './GenreTile';
import OnboardingFooter from './OnboardingFooter';
import './GenreStep.css';

const SEARCH_LIMIT = 12;

export default function GenreStep({ selected, onChange, onNext }) {
  const t = useT();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const searchId = useId();

  const results = useMemo(() => searchGenres(search).slice(0, SEARCH_LIMIT), [search]);
  const missing = Math.max(0, MIN_GENRES - selected.length);

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id]);
  }

  return (
    <>
      <main className="genre-step page">
        <div className="onboarding__intro">
          <h1 className="onboarding__title">
            {t('Elegí al menos')} <span className="highlight">{t('1 género')}</span>
          </h1>
          <p className="onboarding__subtitle">
            {t('Buscalo o mirá la lista completa. Con esto armamos tus recomendaciones y el color de tu ALBOOM.')}
          </p>
        </div>

        <div className="genre-step__finder">
          <div className="genre-step__search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <label htmlFor={searchId} className="visually-hidden">
              {t('Buscar un género')}
            </label>
            <input
              id={searchId}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('Buscá un género: rock, cumbia, jazz…')}
              autoComplete="off"
            />
          </div>
          <Button variant="secondary" size="lg" className="genre-step__all" onClick={() => setDialogOpen(true)}>
            {t('Ver todos ({n})', { n: TOTAL_GENRES })}
          </Button>
        </div>

        {search.trim() && (
          <div className="genre-step__results" aria-live="polite">
            {results.length === 0 ? (
              <p className="genre-step__empty">{t('No encontramos ese género. Probá con «Ver todos».')}</p>
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

        <section className="genre-step__chosen" aria-labelledby="chosen-title">
          <h2 id="chosen-title" className="label-caps">
            {t('Tus géneros')}
          </h2>
          {selected.length === 0 ? (
            <p className="genre-step__placeholder">{t('Todavía no elegiste ninguno. Los que elijas aparecen acá.')}</p>
          ) : (
            <div className="genre-step__grid">
              {selected.map((id) => (
                <GenreTile key={id} label={genreName(id)} selected onToggle={() => toggle(id)} />
              ))}
            </div>
          )}
        </section>
      </main>

      <OnboardingFooter
        start={
          missing > 0 ? (
            <span className="genre-step__missing" role="status">
              {t('Elegí al menos 1 género para seguir.')}
            </span>
          ) : (
            <span role="status">
              <span className="highlight">{t('{n} elegidos', { n: selected.length })}</span>
              <span className="genre-step__more"> · {t('podés sumar más')}</span>
            </span>
          )
        }
      >
        <Button size="lg" disabled={missing > 0} onClick={onNext}>
          {t('Siguiente')}
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
