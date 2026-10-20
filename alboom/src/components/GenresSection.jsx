// Perfil → Tus géneros: chips actuales y "Editar géneros" (reusa el diálogo de todos los géneros).

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { genreName, MIN_GENRES } from '../data/genres';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { profileErrorMessage, updateGenres } from '../services/profile';
import Button from './Button';
import GenreDialog from './GenreDialog';
import ProfileSection from './ProfileSection';
import './GenresSection.css';

export default function GenresSection() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const genres = profile?.genres ?? [];
  const { run, pending } = useAsyncAction((ids) => updateGenres(user.uid, ids));

  async function save(ids) {
    try {
      await run(ids);
      setDialogOpen(false);
      showToast({ type: 'success', message: 'Guardamos tus géneros.' });
    } catch (error) {
      showToast({ type: 'error', message: profileErrorMessage(error) });
    }
  }

  return (
    <ProfileSection
      id="generos"
      title="Tus géneros"
      subtitle="Se usan para tus recomendaciones en Inicio y Explorar."
      action={
        <Button variant="secondary" size="sm" pending={pending} onClick={() => setDialogOpen(true)}>
          Editar géneros
        </Button>
      }
    >
      <div className="genres-section__chips">
        {genres.length === 0 && <p className="genres-section__empty">Todavía no elegiste géneros.</p>}
        {genres.map((id) => (
          <span key={id} className="genres-section__chip">
            {genreName(id)}
          </span>
        ))}
      </div>
      <GenreDialog
        open={dialogOpen}
        multiple
        minimum={MIN_GENRES}
        initialSelected={genres}
        onClose={() => setDialogOpen(false)}
        onConfirm={save}
      />
    </ProfileSection>
  );
}
