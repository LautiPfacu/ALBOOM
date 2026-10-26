// Pop-up de primera tarea, después del onboarding: buscar, guardar, puntuar y reseñar un disco.
// Se puede omitir. "Empezar" cierra el pop-up y pone el foco en el buscador.
//
//   <FirstTaskDialog open={open} onStart={start} onSkip={skip} />

import { useId } from 'react';
import { useT } from '../i18n/LanguageContext';
import Button from './Button';
import Dialog from './Dialog';
import './FirstTaskDialog.css';

const STEPS = [
  { id: 'buscar', title: 'Buscá un disco', text: 'Uno que hayas escuchado hace poco.' },
  { id: 'guardar', title: 'Guardalo', text: 'Como «Escuchado» o «Para escuchar».' },
  { id: 'puntuar', title: 'Puntualo', text: 'De 1 a 5 estrellas.' },
  { id: 'resenar', title: 'Escribí tu reseña', text: 'Unas líneas sobre qué te pareció.' },
];

export default function FirstTaskDialog({ open, onStart, onSkip }) {
  const titleId = useId();
  const t = useT();

  return (
    <Dialog open={open} onClose={onSkip} labelledBy={titleId} className="first-task">
      <h2 id={titleId} className="dialog__title">
        {t('Tu primera tarea')}
      </h2>
      <p className="dialog__text">{t('Cuatro pasos para arrancar tu ALBOOM. Es opcional.')}</p>
      <ol className="first-task__steps">
        {STEPS.map((step, index) => (
          <li key={step.id} className="first-task__step">
            <span className="first-task__number" aria-hidden="true">
              {index + 1}
            </span>
            <span>
              <strong className="first-task__title">{t(step.title)}</strong>
              <span className="first-task__text">{t(step.text)}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="dialog__actions">
        <Button variant="secondary" size="sm" onClick={onSkip}>
          Omitir
        </Button>
        <Button size="sm" onClick={onStart}>
          Empezar
        </Button>
      </div>
    </Dialog>
  );
}
