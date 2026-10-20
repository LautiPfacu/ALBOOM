// "Reportar un problema": guarda el reporte en reports/{id} (las reglas solo dejan crear).

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { profileErrorMessage, sendReport } from '../services/profile';
import Button from './Button';
import ProfileSection from './ProfileSection';
import TextField from './TextField';
import './ReportSection.css';

const MAX_MESSAGE = 2000;

export default function ReportSection() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [screen, setScreen] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const { run, pending } = useAsyncAction(() => sendReport(user.uid, { email: user.email, screen, message }));

  const messageError = message.trim().length < 10 ? 'Contanos un poco más (al menos 10 caracteres).' : undefined;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    if (messageError) return;
    try {
      await run();
      setSent(true);
      showToast({ type: 'success', message: '¡Gracias! Recibimos tu reporte.' });
    } catch (error) {
      showToast({ type: 'error', message: profileErrorMessage(error) });
    }
  }

  if (sent) {
    return (
      <ProfileSection id="reportar" title="¡Gracias!" subtitle="Recibimos tu reporte. Te respondemos por mail.">
        <Button
          variant="secondary"
          onClick={() => {
            setSent(false);
            setSubmitted(false);
            setScreen('');
            setMessage('');
          }}
        >
          Reportar otro problema
        </Button>
      </ProfileSection>
    );
  }

  return (
    <ProfileSection
      id="reportar"
      title="Reportar un problema"
      subtitle="Contanos qué pasó y en qué pantalla. Te respondemos por mail."
    >
      <form className="report-section" onSubmit={handleSubmit} noValidate>
        <TextField
          id="report-screen"
          label="¿En qué pantalla? (opcional)"
          placeholder="Por ejemplo: Biblioteca"
          value={screen}
          maxLength={80}
          onChange={(event) => setScreen(event.target.value)}
        />
        <div className="report-section__field">
          <label htmlFor="report-message" className="text-field__label">
            ¿Qué pasó?
          </label>
          <textarea
            id="report-message"
            className={`report-section__textarea${submitted && messageError ? ' report-section__textarea--error' : ''}`}
            value={message}
            maxLength={MAX_MESSAGE}
            onChange={(event) => setMessage(event.target.value)}
            aria-invalid={submitted && messageError ? true : undefined}
            aria-describedby={submitted && messageError ? 'report-message-error' : undefined}
          />
          {submitted && messageError && (
            <p id="report-message-error" className="text-field__error">
              {messageError}
            </p>
          )}
        </div>
        <div className="report-section__actions">
          <Button type="submit" pending={pending}>
            {pending ? 'Enviando…' : 'Enviar reporte'}
          </Button>
        </div>
      </form>
    </ProfileSection>
  );
}
