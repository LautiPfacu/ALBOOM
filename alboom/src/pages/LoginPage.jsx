// Login y registro en la misma pantalla (selector "Entrar" / "Crear cuenta").
// Cuando Firebase confirma la sesión, PublicOnlyRoute redirige solo: acá no navegamos.

import { useMemo, useRef, useState } from 'react';
import Button from '../components/Button';
import EyeIcon from '../components/EyeIcon';
import LoginIllustration from '../components/LoginIllustration';
import TextField from '../components/TextField';
import { useAsyncAction } from '../hooks/useAsyncAction';
import {
  authErrorMessage,
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
  const [mode, setMode] = useState('login'); // 'login' | 'register'
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
  const busy = emailAction.pending || googleAction.pending;

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

  let submitLabel = isRegister ? 'Crear cuenta' : 'Entrar';
  if (emailAction.pending) submitLabel = isRegister ? 'Creando cuenta…' : 'Entrando…';

  return (
    <div className="login-page">
      <LoginIllustration />

      <main className="login-page__panel">
        <div className="login-page__brand">
          <h1 className="login-page__logo">ALBOOM</h1>
          <p className="login-page__tagline">Tu diario de discos.</p>
        </div>

        <div className="login-page__modes" role="group" aria-label="Elegí qué querés hacer">
          <button
            type="button"
            className="login-page__mode"
            aria-pressed={!isRegister}
            onClick={() => changeMode('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className="login-page__mode"
            aria-pressed={isRegister}
            onClick={() => changeMode('register')}
          >
            Crear cuenta
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
          {googleAction.pending ? 'Conectando con Google…' : 'Continuar con Google'}
        </Button>

        <div className="login-page__divider">o con tu email</div>

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
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPassword((current) => !current)}
            >
              <EyeIcon crossed={showPassword} />
            </button>
          </TextField>

          {formError && (
            <p className="login-page__form-error" role="alert">
              {formError}
            </p>
          )}

          <Button type="submit" size="lg" block pending={emailAction.pending} disabled={busy}>
            {submitLabel}
          </Button>
        </form>
      </main>
    </div>
  );
}
