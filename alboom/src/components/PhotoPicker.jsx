// Foto de perfil: "Cambiar foto" y "Quitar".
// La imagen se recorta y achica en el navegador (utils/image.js) y se guarda en Firestore.
// El <input type="file"> va dentro de un <label>: tocar el "botón" abre el selector de archivos
// sin tener que manipular el DOM.

import { useId, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { photoFor, profileErrorMessage, updatePhoto } from '../services/profile';
import { PhotoError, preparePhoto } from '../utils/image';
import Avatar from './Avatar';
import './PhotoPicker.css';

export default function PhotoPicker() {
  const { user, profile, displayName } = useAuth();
  const { showToast } = useToast();
  const inputId = useId();
  const [error, setError] = useState(null);
  const photoURL = photoFor(profile, user);

  const saveAction = useAsyncAction(async (file) => updatePhoto(user.uid, await preparePhoto(file)));
  const removeAction = useAsyncAction(() => updatePhoto(user.uid, null));
  const busy = saveAction.pending || removeAction.pending;

  async function handleFile(event) {
    const file = event.target.files[0];
    event.target.value = ''; // así se puede volver a elegir la misma imagen
    if (!file) return;
    setError(null);
    try {
      await saveAction.run(file);
      showToast({ type: 'success', message: 'Cambiaste tu foto de perfil.' });
    } catch (saveError) {
      // Los errores de la imagen se muestran junto a la foto; los de Firestore, en un aviso.
      if (saveError instanceof PhotoError) setError(saveError.message);
      else showToast({ type: 'error', message: profileErrorMessage(saveError) });
    }
  }

  async function handleRemove() {
    setError(null);
    try {
      await removeAction.run();
      showToast({ type: 'success', message: 'Quitaste tu foto de perfil.' });
    } catch (removeError) {
      showToast({ type: 'error', message: profileErrorMessage(removeError) });
    }
  }

  let changeLabel = 'Cambiar foto';
  if (saveAction.pending) changeLabel = 'Guardando…';

  return (
    <div className="photo-picker">
      <Avatar name={displayName} photoURL={photoURL} size={72} display />
      <div className="photo-picker__controls">
        <div className="photo-picker__buttons">
          <label
            htmlFor={inputId}
            className={`btn btn--secondary btn--sm photo-picker__change${busy ? ' photo-picker__change--busy' : ''}`}
          >
            {saveAction.pending && <alboom-loader size={18} aria-hidden="true" />}
            {changeLabel}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="visually-hidden"
            disabled={busy}
            aria-describedby={error ? `${inputId}-error` : undefined}
            onChange={handleFile}
          />
          {photoURL && (
            <button type="button" className="text-link" disabled={busy} onClick={handleRemove}>
              {removeAction.pending ? 'Quitando…' : 'Quitar'}
            </button>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="photo-picker__error" role="alert">
            {error}
          </p>
        ) : (
          <p className="photo-picker__hint">JPG, PNG o WebP, hasta 5 MB. La recortamos cuadrada.</p>
        )}
      </div>
    </div>
  );
}
