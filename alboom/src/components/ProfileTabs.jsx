// Segmentado del perfil: Actividad (sus posteos) · Reseñas · Biblioteca (grilla chica).
//   <ProfileTabs uid={uid} reviews={reviews} library={items} libraryLoading />

import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { usePostsBy } from '../hooks/usePostsBy';
import { STATUS } from '../services/library';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import LibraryCardSmall from './LibraryCardSmall';
import Loader from './Loader';
import PostCard from './PostCard';
import PostFeed from './PostFeed';
import { useT } from '../i18n/LanguageContext';
import './ProfileTabs.css';

export default function ProfileTabs({ uid, isMe, reviews, reviewsLoading, library, libraryLoading, libraryError }) {
  const [tab, setTab] = useState('actividad');
  const t = useT();
  const activity = usePostsBy(tab === 'actividad' ? [uid] : []);
  const { getItem } = useLibrary();

  const tabs = [
    { id: 'actividad', label: t('Actividad') },
    { id: 'resenas', label: `${t('Reseñas')} · ${reviews.length}` },
    { id: 'biblioteca', label: `${t('Biblioteca')} · ${library.length}` },
  ];

  return (
    <section className="profile-tabs">
      <div className="segmented profile-tabs__switch" role="tablist" aria-label={t('Contenido del perfil')}>
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            className="segmented__option"
            aria-selected={tab === item.id}
            aria-pressed={tab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="profile-tabs__panel">
        {tab === 'actividad' && (
          <PostFeed
            {...activity}
            empty={
              <EmptyState
                variant="dashed"
                title="Sin actividad todavía"
                text={isMe ? 'Cuando reseñes un disco o actualices tu Top 5, aparece acá.' : 'Todavía no publicó nada.'}
              />
            }
          />
        )}

        {tab === 'resenas' &&
          (reviewsLoading ? (
            <Loader size={48} label="Cargando reseñas…" />
          ) : reviews.length === 0 ? (
            <EmptyState variant="dashed" title="Silencio total" text="Todavía no hay reseñas públicas." />
          ) : (
            <div className="post-feed">
              {reviews.map((review) => (
                <PostCard
                  key={review.id}
                  readOnly
                  post={{ ...review, type: 'review', album: { albumId: review.albumId, ...review.album } }}
                />
              ))}
            </div>
          ))}

        {tab === 'biblioteca' &&
          (libraryLoading ? (
            <Loader size={48} label="Cargando biblioteca…" />
          ) : libraryError ? (
            <ErrorState message={libraryError} />
          ) : library.length === 0 ? (
            <EmptyState variant="dashed" title="Biblioteca vacía" text="Todavía no guardó discos." />
          ) : (
            <div className="profile-tabs__library">
              {library.map((item) => (
                <div key={item.id} className="profile-tabs__library-item">
                  <LibraryCardSmall item={item} />
                  {/* Si no es tu perfil, marcamos en verde los que vos ya escuchaste */}
                  {!isMe && getItem(item.id)?.status === STATUS.LISTENED && (
                    <span className="profile-tabs__listened" title={t('Ya lo escuchaste')}>
                      <span aria-hidden="true">✓</span>
                      <span className="visually-hidden">{t('Ya lo escuchaste')}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
      </div>
    </section>
  );
}
