// "Seguidores en común": de las personas que seguís, cuáles siguen a este perfil.

import { useEffect, useState } from 'react';
import { useFollow } from '../context/FollowContext';
import { getCommonFollowers } from '../services/follows';
import Avatar from './Avatar';
import { useT } from '../i18n/LanguageContext';
import './SideCard.css';
import './CommonFollowersCard.css';

export default function CommonFollowersCard({ uid }) {
  const t = useT();
  const { followingIds, loading: followLoading } = useFollow();
  const [state, setState] = useState({ key: null, people: [] });
  const key = followLoading ? null : `${uid}|${followingIds.join(',')}`;

  useEffect(() => {
    if (!key) return undefined;
    let cancelled = false;
    getCommonFollowers(followingIds, uid)
      .then((people) => !cancelled && setState({ key, people }))
      .catch(() => !cancelled && setState({ key, people: [] }));
    return () => {
      cancelled = true;
    };
    // followingIds ya está representado en `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, uid]);

  const people = state.key === key ? state.people : [];
  if (people.length === 0) return null;

  const names = people.slice(0, 2).map((p) => p.displayName.split(' ')[0]);
  const rest = people.length - names.length;

  return (
    <aside className="side-card" aria-labelledby="common-followers-title">
      <h2 id="common-followers-title" className="side-card__title">
        {t('Seguidores en común')}
      </h2>
      <div className="common-followers__avatars" aria-hidden="true">
        {people.slice(0, 5).map((person) => (
          <Avatar key={person.uid} name={person.displayName} photoURL={person.photoURL} size={40} colorful />
        ))}
      </div>
      <p className="side-card__text">
        {people.length === 1 ? t('La sigue') : t('La siguen')} {names.join(', ')}
        {rest > 0 && (rest === 1 ? t(' y 1 persona más') : t(' y {n} personas más', { n: rest }))} {t('que seguís.')}
      </p>
    </aside>
  );
}
