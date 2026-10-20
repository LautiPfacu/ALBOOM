// Perfil → Tu cuenta: foto, nombre, nombre de usuario (con chequeo de disponibilidad) y email.

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import {
  changeEmail,
  isUsernameAvailable,
  profileErrorMessage,
  providerIds,
  updateAccount,
  USERNAME_PATTERN,
} from '../services/profile';
import Button from './Button';
import PhotoPicker from './PhotoPicker';
import ProfileSection from './ProfileSection';
import TextField from './TextField';
import './AccountSection.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate({ name, username, email }) {
  const errors = {};
  if (name.trim().length < 2 || name.trim().length > 30) errors.name = 'Escribí tu nombre (2 a 30 caracteres).';
  if (!USERNAME_PATTERN.test(username)) {
    errors.username = 'De 3 a 20 caracteres: letras minúsculas, números, punto o guion bajo.';
  }
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Ingresá un email válido, por ejemplo nombre@mail.com.';
  return errors;
}

export default function AccountSection() {
  const { user, profile, displayName } = useAuth();
  const { showToast } = useToast();
  const canChangeEmail = providerIds(user).includes('password');

  const [values, setValues] = useState({
    name: displayName,
    username: profile?.username ?? '',
    email: user.email ?? '',
  });
  const [submitted, setSubmitted] = useState(false);
  // Resultado del chequeo de disponibilidad: { username, available }
  const [availability, setAvailability] = useState(null);

  const saveAction = useAsyncAction(async () => {
    const accountChanged = values.name.trim() !== displayName || values.username !== (profile?.username ?? '');
    if (accountChanged) {
      await updateAccount(user.uid, {
        displayName: values.name,
        username: values.username,
        previousUsername: profile?.username,
      });
    }
    const emailChanged = canChangeEmail && values.email.trim() !== user.email;
    if (emailChanged) await changeEmail(values.email);
    return { accountChanged, emailChanged };
  });

  const errors = validate(values);
  const showError = (field) => (submitted ? errors[field] : undefined);
  const usernameTaken = availability?.username === values.username && availability.available === false;

  function handleChange(event) {
    const { name, value } = event.target;
    // El nombre de usuario se escribe siempre en minúsculas.
    setValues((current) => ({ ...current, [name]: name === 'username' ? value.toLowerCase() : value }));
  }

  async function checkUsername() {
    const { username } = values;
    if (!USERNAME_PATTERN.test(username) || username === profile?.username) {
      setAvailability(null);
      return;
    }
    try {
      const available = await isUsernameAvailable(username, user.uid);
      setAvailability({ username, available });
    } catch {
      setAvailability(null); // si no se pudo revisar, lo revisa la transacción al guardar
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0 || usernameTaken) return;
    try {
      const result = await saveAction.run();
      if (result?.emailChanged) {
        showToast({ type: 'success', message: `Te mandamos un mail a ${values.email.trim()} para confirmarlo.` });
      } else if (result?.accountChanged) {
        showToast({ type: 'success', message: 'Guardamos tus cambios.' });
      }
      setSubmitted(false);
    } catch (error) {
      if (error.code === 'app/username-taken') setAvailability({ username: values.username, available: false });
      showToast({ type: 'error', message: profileErrorMessage(error) });
    }
  }

  let usernameHint = 'Así te ven en la comunidad.';
  if (availability?.username === values.username && availability.available) usernameHint = 'Está disponible ✓';

  return (
    <ProfileSection id="cuenta" title="Tu cuenta">
      <PhotoPicker />

      <form className="account-section__form" onSubmit={handleSubmit} noValidate>
        <div className="account-section__grid">
          <TextField
            id="account-name"
            name="name"
            label="Nombre"
            value={values.name}
            onChange={handleChange}
            autoComplete="name"
            error={showError('name')}
          />
          <div className="account-section__field">
            <TextField
              id="account-username"
              name="username"
              label="Nombre de usuario"
              value={values.username}
              onChange={handleChange}
              onBlur={checkUsername}
              autoComplete="username"
              error={showError('username') ?? (usernameTaken ? 'Ese nombre de usuario ya está en uso.' : undefined)}
            >
              <span className="account-section__at" aria-hidden="true">
                @
              </span>
            </TextField>
            <p className="account-section__hint">{usernameHint}</p>
          </div>
          <div className="account-section__field">
            <TextField
              id="account-email"
              name="email"
              type="email"
              label="Email"
              value={values.email}
              onChange={handleChange}
              autoComplete="email"
              readOnly={!canChangeEmail}
              error={showError('email')}
            />
            <p className="account-section__hint">
              {canChangeEmail
                ? 'Si lo cambiás, te mandamos un mail para confirmarlo.'
                : 'Entrás con Google: el email lo maneja tu cuenta de Google.'}
            </p>
          </div>
        </div>
        <div className="account-section__actions">
          <Button type="submit" pending={saveAction.pending}>
            {saveAction.pending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </ProfileSection>
  );
}
