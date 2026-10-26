// Comunidad (/comunidad): posteos de la gente que seguís ("Siguiendo") o recomendados ("Para vos").
// La pestaña elegida se recuerda en localStorage (preferencia de este navegador).

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';
import { useForYouFeed } from '../hooks/useForYouFeed';
import { usePeopleSuggestions } from '../hooks/usePeopleSuggestions';
import { usePostsBy } from '../hooks/usePostsBy';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { useAuthor } from '../hooks/useAuthor';
import AlbumPickerDialog from '../components/AlbumPickerDialog';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import PeopleSuggestionsCard from '../components/PeopleSuggestionsCard';
import PersonRow from '../components/PersonRow';
import PostFeed from '../components/PostFeed';
import { useRequireAccount } from '../hooks/useRequireAccount';
import { useT } from '../i18n/LanguageContext';
import './CommunityPage.css';

const TAB_KEY = 'alboom:communityTab';

function readSavedTab() {
  try {
    return localStorage.getItem(TAB_KEY) === 'para-vos' ? 'para-vos' : 'siguiendo';
  } catch {
    return 'siguiendo';
  }
}

export default function CommunityPage() {
  const requireAccount = useRequireAccount();
  const t = useT();
  const { user } = useAuth();
  const { author } = useAuthor();
  const { followingIds, loading: followLoading } = useFollow();
  const { profile: me } = usePublicProfile(user.uid);
  const [tab, setTab] = useState(readSavedTab);
  const [pickerOpen, setPickerOpen] = useState(false);

  function openComposer() {
    if (requireAccount()) return;
    setPickerOpen(true);
  }

  // "Siguiendo": tus posteos y los de quienes seguís. "Para vos": de gente que no seguís.
  const following = usePostsBy(followLoading || tab !== 'siguiendo' ? [] : [user.uid, ...followingIds]);
  const forYou = useForYouFeed(tab === 'para-vos' ? me : null);
  const { people: suggestions } = usePeopleSuggestions(me, 3);

  function changeTab(next) {
    setTab(next);
    try {
      localStorage.setItem(TAB_KEY, next);
    } catch {
      // Sin localStorage la pestaña igual cambia, solo que no se recuerda.
    }
  }

  const followingEmpty = (
    <div className="community__empty">
      <EmptyState title="Todavía no seguís a nadie" text="Seguí a gente con tus gustos y acá vas a ver lo que reseñan y escuchan.">
        <div className="community__empty-people">
          {suggestions.map((person) => (
            <PersonRow key={person.uid} person={person} detail={person.reason} />
          ))}
        </div>
      </EmptyState>
    </div>
  );

  return (
    <div className="community page">
      <div className="community__layout">
        <div className="community__main">
          <header className="community__header">
            <div className="page-header community__heading">
              <h1 className="page-header__title">{t('Comunidad')}</h1>
              <p className="page-header__subtitle">
                {tab === 'siguiendo'
                  ? t('Lo que reseñan y escuchan las personas que seguís.')
                  : t('Posteos de gente con tus gustos que todavía no seguís.')}
              </p>
            </div>
            <div className="segmented community__tabs" role="group" aria-label={t('Qué ver')}>
              <button type="button" className="segmented__option" aria-pressed={tab === 'siguiendo'} onClick={() => changeTab('siguiendo')}>
                {t('Siguiendo')}
              </button>
              <button type="button" className="segmented__option" aria-pressed={tab === 'para-vos'} onClick={() => changeTab('para-vos')}>
                {t('Para vos')}
              </button>
            </div>
          </header>

          <div className="community__composer">
            <Avatar name={author.displayName} photoURL={author.photoURL} size={40} />
            <button type="button" className="community__composer-input" onClick={openComposer}>
              {t('¿Qué escuchaste? Reseñá un disco y aparece acá.')}
            </button>
            <Button size="sm" onClick={openComposer}>
              Escribir reseña
            </Button>
          </div>

          {tab === 'siguiendo' ? (
            <PostFeed {...following} empty={followingEmpty} />
          ) : (
            <PostFeed
              {...forYou}
              showFollow
              empty={
                <EmptyState
                  variant="dashed"
                  title="Nada por acá"
                  text="Todavía no hay posteos de gente que no seguís. Volvé en un rato."
                />
              }
            />
          )}
        </div>

        <div className="community__aside">{me && <PeopleSuggestionsCard me={me} />}</div>
      </div>

      <AlbumPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  );
}
