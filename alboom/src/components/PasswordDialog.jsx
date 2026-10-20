// Cambiar contraseña: pide la actual (reautenticación) y la nueva.

import { useState } from 'react';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { changePassword, profileErrorMessage } from '../services/profile';
import Button from './Button';
import Dialog from './Dialog';
import TextField from './TextField';

export default function PasswordDialog({ open, onClose, onDone }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="password-dialog-title">
      <PasswordForm onClose={onClose} onDone={onDone} />
    </Dialog>
  );
}

function PasswordForm({ onClose, onDone }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const { run, pending } = useAsyncAction(() => changePassword(current, next));

  const errors = {
    current: current ? undefined : 'Escribí tu contraseña actual.',
    next: next.length >= 6 ? undefined : 'Tiene que tener al menos 6 caracteres.',
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setError(null);
    if (errors.current || errors.next) return;
    try {
      await run();
      onDone();
    } catch (changeError) {
      setError(profileErrorMessage(changeError));
    }
  }

  return (
    <form className="dialog__form" onSubmit={handleSubmit} noValidate>
      <h2 id="password-dialog-title" className="dialog__title">
        Cambiar contraseña
      </h2>
      <p className="dialog__text">Por seguridad, primero confirmá tu contraseña actual.</p>
      <TextField
        id="password-current"
        type="password"
        label="Contraseña actual"
        autoComplete="current-password"
        value={current}
        onChange={(event) => setCurrent(event.target.value)}
        error={submitted ? errors.current : undefined}
        autoFocus
      />
      <TextField
        id="password-new"
        type="password"
        label="Contraseña nueva"
        autoComplete="new-password"
        value={next}
        onChange={(event) => setNext(event.target.value)}
        error={submitted ? errors.next : undefined}
      />
      {error && (
        <p className="dialog__error" role="alert">
          {error}
        </p>
      )}
      <div className="dialog__actions">
        <Button variant="secondary" size="sm" disabled={pending} onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" pending={pending}>
          {pending ? 'Guardando…' : 'Cambiar contraseña'}
        </Button>
      </div>
    </form>
  );
}
