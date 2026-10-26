// Pop-up "Seguidores y seguidos": dos pestañas, buscador local y filas con "Seguir".
//   <FollowersDialog open uid={uid} initialTab="followers" counts={{ followers, following }} onClose />

import { useEffect, useId, useMemo, useState } from 'react';
import { getFollowList } from '../services/follows';
import { normalizeText } from '../utils/text';
import Dialog from './Dialog';
import Loader from './Loader';
import PersonRow from './PersonRow';
import { useT } from '../i18n/LanguageContext';
import './PeopleSearchDialog.css';

export default function FollowersDialog({ open, onClose, uid, initialTab, counts }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="followers-title">
      <FollowersContent onClose={onClose} uid={uid} initialTab={initialTab} counts={counts} />
    </Dialog>
  );
}

function FollowersContent({ onClose, uid, initialTab, counts }) {
  const t = useT();
  const [tab, setTab] = useState(initialTab);
  const [filter, setFilter] = useState('');
  const [state, setState] = useState({ key: null, people: [], error: null });
  const inputId = useId();
  const key = `${uid}|${tab}`;

  // CONSULTAR: follows donde followed == uid (seguidores) o follower == uid (seguidos).
  useEffect(() => {
    let cancelled = false;
    getFollowList(uid, tab)
      .then((people) => !cancelled && setState({ key, people, error: null }))
      .catch(() => !cancelled && setState({ key, people: [], error: 'No pudimos cargar la lista.' }));
    return () => {
      cancelled = true;
    };
  }, [uid, tab, key]);

  const loading = state.key !== key;
  // Buscador local: filtra lo que ya está cargado (sin tildes).
  const people = useMemo(() => {
    const needle = normalizeText(filter.trim().replace(/^@/, ''));
    if (!needle) return state.people;
    return state.people.filter((p) => normalizeText(`${p.displayName} ${p.username}`).includes(needle));
  }, [state.people, filter]);

  return (
    <>
      <div className="dialog__header">
        <h2 id="followers-title" className="dialog__title">
          {tab === 'followers' ? t('Seguidores') : t('Seguidos')}
        </h2>
        <button type="button" className="dialog__close" aria-label={t('Cerrar')} onClick={onClose}>
          ×
        </button>
      </div>

      <div className="segmented followers__tabs" role="group" aria-label={t('Lista')}>
        <button type="button" className="segmented__option" aria-pressed={tab === 'followers'} onClick={() => setTab('followers')}>
          {t('Seguidores')} · {counts.followers}
        </button>
        <button type="button" className="segmented__option" aria-pressed={tab === 'following'} onClick={() => setTab('following')}>
          {t('Seguidos')} · {counts.following}
        </button>
      </div>

      <div className="people-search__box">
        <label htmlFor={inputId} className="visually-hidden">
          {t('Buscar en la lista')}
        </label>
        <input
          id={inputId}
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder={t('Buscar')}
          autoComplete="off"
        />
      </div>

      {loading && <Loader size={40} label="Cargando…" />}
      {!loading && state.error && <p className="dialog__error">{t(state.error)}</p>}
      {!loading && !state.error && people.length === 0 && (
        <p className="people-search__empty">
          {filter ? t('No hay nadie con ese nombre en la lista.') : t('Todavía no hay nadie acá.')}
        </p>
      )}
      <div>
        {!loading && people.map((person) => <PersonRow key={person.uid} person={person} onNavigate={onClose} />)}
      </div>
    </>
  );
}
