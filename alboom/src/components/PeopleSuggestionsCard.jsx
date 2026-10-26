// Tarjeta "Gente con tus gustos": 3 personas sugeridas + "Buscar personas".

import { useState } from 'react';
import { usePeopleSuggestions } from '../hooks/usePeopleSuggestions';
import Loader from './Loader';
import PeopleSearchDialog from './PeopleSearchDialog';
import PersonRow from './PersonRow';
import './SideCard.css';

export default function PeopleSuggestionsCard({ me }) {
  const { people, loading } = usePeopleSuggestions(me, 3);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <aside className="side-card" aria-labelledby="people-suggestions-title">
      <h2 id="people-suggestions-title" className="side-card__title">
        Gente con tus gustos
      </h2>
      {loading && <Loader size={40} />}
      {!loading && people.length === 0 && (
        <p className="side-card__text">Todavía no encontramos a nadie con tus gustos. Probá buscando por nombre.</p>
      )}
      <div>
        {people.map((person) => (
          <PersonRow key={person.uid} person={person} detail={person.reason} />
        ))}
      </div>
      <button type="button" className="btn btn--secondary btn--sm side-card__action" onClick={() => setSearchOpen(true)}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        Buscar personas
      </button>
      <PeopleSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} me={me} />
    </aside>
  );
}
