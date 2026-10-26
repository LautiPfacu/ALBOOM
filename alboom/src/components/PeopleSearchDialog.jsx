// Pop-up "Buscar personas": por nombre o @usuario, "Con tus mismos gustos" y "Referentes".

import { useEffect, useId, useState } from 'react';
import { usePeopleSuggestions } from '../hooks/usePeopleSuggestions';
import { getReferents, searchPeople } from '../services/publicProfile';
import { plural } from '../utils/text';
import Dialog from './Dialog';
import Loader from './Loader';
import PersonRow from './PersonRow';
import './PeopleSearchDialog.css';

export default function PeopleSearchDialog({ open, onClose, me }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="people-search-title" className="dialog--wide">
      <PeopleSearchContent onClose={onClose} me={me} />
    </Dialog>
  );
}

function PeopleSearchContent({ onClose, me }) {
  const inputId = useId();
  const [text, setText] = useState('');
  const [results, setResults] = useState({ term: '', people: [], error: null });
  const [referents, setReferents] = useState([]);
  const { people: similar } = usePeopleSuggestions(me, 3);
  const term = text.trim();

  // Busca mientras escribís, esperando 300 ms desde la última tecla (así no se pide por cada letra).
  useEffect(() => {
    if (term.replace(/^@/, '').length < 2) return undefined;
    let cancelled = false;
    const timer = setTimeout(() => {
      searchPeople(term)
        .then((people) => !cancelled && setResults({ term, people, error: null }))
        .catch(() => !cancelled && setResults({ term, people: [], error: 'No pudimos buscar. Probá de nuevo.' }));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  // Referentes: las cuentas con más seguidores (una vez al abrir).
  useEffect(() => {
    let cancelled = false;
    getReferents(5)
      .then((people) => !cancelled && setReferents(people))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const searching = term.replace(/^@/, '').length >= 2;
  const waiting = searching && results.term !== term;

  return (
    <>
      <div className="dialog__header">
        <h2 id="people-search-title" className="dialog__title">
          Buscar personas
        </h2>
        <button type="button" className="dialog__close" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="people-search__box">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <label htmlFor={inputId} className="visually-hidden">
          Buscá por nombre o @usuario
        </label>
        <input
          id={inputId}
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Buscá por nombre o @usuario"
          autoComplete="off"
          autoFocus
        />
      </div>

      {searching ? (
        <section aria-live="polite">
          {waiting && <Loader size={40} label="Buscando…" />}
          {!waiting && results.error && <p className="dialog__error">{results.error}</p>}
          {!waiting && !results.error && results.people.length === 0 && (
            <p className="people-search__empty">No encontramos a nadie con «{term}».</p>
          )}
          {!waiting &&
            results.people.map((person) => (
              <PersonRow key={person.uid} person={person} detail={person.bio || null} onNavigate={onClose} />
            ))}
        </section>
      ) : (
        <>
          {similar.length > 0 && (
            <section>
              <h3 className="label-caps people-search__group">Con tus mismos gustos</h3>
              {similar.map((person) => (
                <PersonRow key={person.uid} person={person} detail={person.reason} showTop5 onNavigate={onClose} />
              ))}
            </section>
          )}
          {referents.length > 0 && (
            <section>
              <h3 className="label-caps people-search__group">Referentes</h3>
              {referents.map((person) => (
                <PersonRow
                  key={person.uid}
                  person={person}
                  detail={plural(person.followersCount ?? 0, 'seguidor', 'seguidores')}
                  onNavigate={onClose}
                />
              ))}
            </section>
          )}
        </>
      )}
    </>
  );
}
