// Pop-up para elegir un disco y reseñarlo (desde "Escribir reseña" de Comunidad).
// Al elegir uno, lleva a su página con el foco en "Tu escucha".

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlbumSearch } from '../hooks/useAlbumSearch';
import AlbumCover from './AlbumCover';
import Dialog from './Dialog';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import Loader from './Loader';
import SearchBar from './SearchBar';
import { useT } from '../i18n/LanguageContext';
import './AlbumPickerDialog.css';

export default function AlbumPickerDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="album-picker-title" className="dialog--wide">
      <AlbumPicker onClose={onClose} />
    </Dialog>
  );
}

function AlbumPicker({ onClose }) {
  const navigate = useNavigate();
  const t = useT();
  const [text, setText] = useState('');
  const { query, results, status, error, search, reset } = useAlbumSearch();

  function choose(album) {
    onClose();
    navigate(`/disco/${album.id}`, { state: { focusReview: true } });
  }

  return (
    <>
      <div className="dialog__header">
        <div className="dialog__heading">
          <h2 id="album-picker-title" className="dialog__title">
            {t('¿Qué escuchaste?')}
          </h2>
          <p className="dialog__text">{t('Buscá el disco y escribí tu reseña en su página.')}</p>
        </div>
        <button type="button" className="dialog__close" aria-label={t('Cerrar')} onClick={onClose}>
          ×
        </button>
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
      {status === 'loading' && <Loader size={48} label="Buscando discos…" />}
      {status === 'error' && <ErrorState message={error} onRetry={() => search(query)} />}
      {status === 'success' && results.length === 0 && (
        <EmptyState variant="dashed" title="Nada por acá" text={t('No encontramos discos para «{query}».', { query })} />
      )}
      <ul className="album-picker__list">
        {results.map((album) => (
          <li key={album.id}>
            <button type="button" className="album-picker__item" onClick={() => choose(album)}>
              <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="album-picker__cover" />
              <span className="album-picker__info">
                <span className="album-picker__name">{album.name}</span>
                <span className="album-picker__meta">{[album.artist, album.year].filter(Boolean).join(' · ')}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
