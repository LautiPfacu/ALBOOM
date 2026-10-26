// Barra de búsqueda. Es controlada: el texto vive en la página (así los chips pueden completarlo).
// ref llega al <input> (el pop-up de primera tarea lo usa para darle el foco).
// Busca al enviar (Enter o botón), no con cada tecla, para cuidar el límite de pedidos de Spotify.

import { useState } from 'react';
import './SearchBar.css';
import { useT } from '../i18n/LanguageContext';

const MIN_LENGTH = 2;

export default function SearchBar({ value, onChange, onSearch, onClear, ref }) {
  const t = useT();
  const [error, setError] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    // Validamos sin contar espacios antes de llamar a Spotify.
    if (value.trim().length < MIN_LENGTH) {
      setError('Escribí al menos 2 letras.');
      return;
    }
    setError(null);
    onSearch(value);
  }

  function handleChange(event) {
    if (error) setError(null);
    onChange(event.target.value);
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit} noValidate>
      <div className="search-bar__box">
        <svg
          className="search-bar__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <input
          ref={ref}
          className="search-bar__input"
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={t('Buscá un disco o un artista')}
          aria-label={t('Buscar discos')}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'search-bar-error' : undefined}
          enterKeyHint="search"
        />
        {value && (
          <button
            type="button"
            className="search-bar__clear"
            aria-label={t('Borrar búsqueda')}
            onClick={() => {
              setError(null);
              onClear();
            }}
          >
            ×
          </button>
        )}
        <button type="submit" className="search-bar__submit">
          {t('Buscar')}
        </button>
      </div>
      {error && (
        <p className="search-bar__error" id="search-bar-error">
          {t(error)}
        </p>
      )}
    </form>
  );
}
