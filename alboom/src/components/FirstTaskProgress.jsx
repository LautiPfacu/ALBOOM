// Tarjeta flotante con el progreso de la primera tarea (después de tocar "Empezar").
// Así la persona no tiene que acordarse de los pasos: los ve y se tildan solos.
// Se puede achicar (queda "Primera tarea 2/4") o cerrar (no vuelve a aparecer).

import { useId, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFirstTaskWatcher } from '../hooks/useFirstTaskWatcher';
import { useT } from '../i18n/LanguageContext';
import { updateFirstTask } from '../services/profile';
import './FirstTaskProgress.css';

export default function FirstTaskProgress() {
  const { user } = useAuth();
  const { active, steps, doneCount } = useFirstTaskWatcher();
  const t = useT();
  const listId = useId();
  const [collapsed, setCollapsed] = useState(false);
  // Se oculta enseguida al cerrar, sin esperar a que Firestore confirme.
  const [closed, setClosed] = useState(false);

  if (!active || closed) return null;

  function handleClose() {
    setClosed(true);
    updateFirstTask(user.uid, 'skipped').catch(() => {});
  }

  return (
    <aside className="first-task-progress" aria-label={t('Tu primera tarea')}>
      <div className="first-task-progress__head">
        <button
          type="button"
          className="first-task-progress__toggle"
          aria-expanded={!collapsed}
          aria-controls={listId}
          onClick={() => setCollapsed((value) => !value)}
        >
          <span className="first-task-progress__title">{t('Primera tarea')}</span>
          <span className="first-task-progress__count">
            {doneCount}/{steps.length}
          </span>
          <span className="first-task-progress__chevron" aria-hidden="true">
            {collapsed ? '▴' : '▾'}
          </span>
          <span className="visually-hidden">{t(collapsed ? 'Mostrar pasos' : 'Ocultar pasos')}</span>
        </button>
        <button
          type="button"
          className="first-task-progress__close"
          aria-label={t('Cerrar la primera tarea')}
          onClick={handleClose}
        >
          ×
        </button>
      </div>

      {!collapsed && (
        <ol id={listId} className="first-task-progress__steps">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`first-task-progress__step${step.done ? ' first-task-progress__step--done' : ''}`}
            >
              <span className="first-task-progress__check" aria-hidden="true">
                {step.done ? '✓' : ''}
              </span>
              {t(step.title)}
              {step.done && <span className="visually-hidden"> ({t('hecho')})</span>}
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
