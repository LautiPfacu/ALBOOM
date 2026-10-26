// Login y registro en la misma pantalla (selector "Entrar" / "Crear cuenta").
// Arranca en "Crear cuenta". También se puede entrar como invitado, solo para mirar.
// Cuando Firebase confirma la sesión, PublicOnlyRoute redirige solo: acá no navegamos.

import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useT } from '../i18n/LanguageContext';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import EyeIcon from '../components/EyeIcon';
import LanguageSwitcher from '../components/LanguageSwitcher';
import LoginIllustration from '../components/LoginIllustration';
import TextField from '../components/TextField';
import { useAsyncAction } from '../hooks/useAsyncAction';
import {
  authErrorMessage,
  loginAsGuest,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
} from '../services/auth';
import './LoginPage.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELD_ORDER = ['name', 'email', 'password'];
const EMPTY_VALUES = { name: '', email: '', password: '' };

// Devuelve { campo: mensaje } solo para los campos con error. No llama a Firebase.
function validate(values, isRegister) {
  const errors = {};
  if (isRegister) {
    const name = values.name.trim();
    if (name.length < 2 || name.length > 30) errors.name = 'Escribí tu nombre (2 a 30 caracteres).';
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Ingresá un email válido, por ejemplo nombre@mail.com.';
  }
  if (!values.password) {
    errors.password = 'Escribí tu contraseña.';
  } else if (isRegister && values.password.length < 6) {
    errors.password = 'Tiene que tener al menos 6 caracteres.';
  }
  return errors;
}

export default function LoginPage() {
  const t = useT();
  const location = useLocation();
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  // Arranca en "Crear cuenta" (o en lo que pida quien nos mandó acá).
  const [mode, setMode] = useState(location.state?.mode === 'login' ? 'login' : 'register'); // 'login' | 'register'
  const [values, setValues] = useState(EMPTY_VALUES);
  const [touched, setTouched] = useState({}); // campos que la persona ya dejó
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null); // error de Firebase
  const [showPassword, setShowPassword] = useState(false);

  // Refs a los inputs, para mover el foco al primer campo con error.
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const isRegister = mode === 'register';
  const emailAction = useAsyncAction(isRegister ? registerWithEmail : loginWithEmail);
  const googleAction = useAsyncAction(loginWithGoogle);
  const guestAction = useAsyncAction(loginAsGuest);
  const [guestConfirmOpen, setGuestConfirmOpen] = useState(false);
  const busy = emailAction.pending || googleAction.pending || guestAction.pending;

  // Los errores se derivan de los valores: no se guardan en otro estado.
  const errors = useMemo(() => validate(values, isRegister), [values, isRegister]);
  // Mostramos el error de un campo si ya se intentó enviar o si la persona ya salió de ese campo.
  const visibleError = (field) => (submitted || touched[field] ? errors[field] : undefined);

  function changeMode(nextMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setTouched({});
    setSubmitted(false);
    setFormError(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setFormError(null);

    // Validación propia antes de llamar a Firebase. El foco va al primer campo con error.
    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalid) {
      const refs = { name: nameRef, email: emailRef, password: passwordRef };
      refs[firstInvalid].current?.focus();
      return;
    }

    try {
      await emailAction.run(values);
    } catch (error) {
      setFormError(authErrorMessage(error));
    }
  }

  async function handleGoogle() {
    setFormError(null);
    try {
      await googleAction.run();
    } catch (error) {
      setFormError(authErrorMessage(error));
    }
  }

  // Invitado: si ya estás mirando como invitado, volvés a la app; si no, primero lo confirmás.
  function handleGuest() {
    setFormError(null);
    if (isGuest) {
      navigate(location.state?.from ?? '/', { replace: true });
      return;
    }
    setGuestConfirmOpen(true);
  }

  // Confirmado: entra como invitado y va siempre al inicio.
  async function confirmGuest() {
    try {
      await guestAction.run();
      setGuestConfirmOpen(false);
      navigate('/', { replace: true });
    } catch (error) {
      setGuestConfirmOpen(false);
      setFormError(authErrorMessage(error));
    }
  }

  let submitLabel = isRegister ? 'Crear cuenta' : 'Entrar';
  if (emailAction.pending) submitLabel = isRegister ? 'Creando cuenta…' : 'Entrando…';
  // Si llegó un invitado que quiso guardar algo o entrar a un perfil, se lo explicamos.
  const guestNotice = isGuest && location.state?.from;

  return (
    <div className="login-page">
      <LoginIllustration />

      <main className="login-page__panel">
        <LanguageSwitcher />
        <div className="login-page__brand">
          <h1 className="login-page__logo">ALBOOM</h1>
          <p className="login-page__tagline">{t('Tu diario de discos.')}</p>
        </div>

        {guestNotice && (
          <p className="login-page__guest-notice" role="status">
            {t('Para guardar discos, seguir gente y tener tu perfil, creá tu cuenta. Es gratis.')}
          </p>
        )}

        <div className="login-page__modes" role="group" aria-label={t('Elegí qué querés hacer')}>
          <button
            type="button"
            className="login-page__mode"
            aria-pressed={!isRegister}
            onClick={() => changeMode('login')}
          >
            {t('Entrar')}
          </button>
          <button
            type="button"
            className="login-page__mode"
            aria-pressed={isRegister}
            onClick={() => changeMode('register')}
          >
            {t('Crear cuenta')}
          </button>
        </div>

        <Button
          variant="secondary"
          size="lg"
          block
          className="login-page__google"
          disabled={busy}
          onClick={handleGoogle}
        >
          <span className="login-page__google-mark" aria-hidden="true">
            G
          </span>
          {t(googleAction.pending ? 'Conectando con Google…' : 'Continuar con Google')}
        </Button>

        <div className="login-page__divider">{t('o con tu email')}</div>

        <form className="login-page__form" onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <TextField
              id="name"
              name="name"
              label="Nombre"
              placeholder="¿Cómo te llamamos?"
              autoComplete="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={visibleError('name')}
              ref={nameRef}
            />
          )}

          <TextField
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={visibleError('email')}
            ref={emailRef}
          />

          <TextField
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Contraseña"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={visibleError('password')}
            ref={passwordRef}
          >
            <button
              type="button"
              className="login-page__toggle-password"
              aria-label={t(showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña')}
              onClick={() => setShowPassword((current) => !current)}
            >
              <EyeIcon crossed={showPassword} />
            </button>
          </TextField>

          {formError && (
            <p className="login-page__form-error" role="alert">
              {t(formError)}
            </p>
          )}

          <Button type="submit" size="lg" block pending={emailAction.pending} disabled={busy}>
            {submitLabel}
          </Button>
        </form>

        <button type="button" className="text-link login-page__guest" disabled={busy} onClick={handleGuest}>
          {t(isGuest ? 'Seguir mirando como invitado' : guestAction.pending ? 'Entrando…' : 'Entrar como invitado')}
        </button>

        <ConfirmDialog
          open={guestConfirmOpen}
          title="¿Seguro que querés continuar como invitado?"
          text="No vas a poder hacer reseñas, modificar tu perfil ni guardar tus discos."
          confirmLabel="Continuar como invitado"
          pendingLabel="Entrando…"
          confirmVariant="primary"
          pending={guestAction.pending}
          onConfirm={confirmGuest}
          onCancel={() => setGuestConfirmOpen(false)}
        />
      </main>
    </div>
  );
}
