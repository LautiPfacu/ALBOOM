// Confirmación antes de una acción que no se puede deshacer (por ejemplo, quitar un disco).
//
//   <ConfirmDialog open={open} title="¿Quitar X?" text="…" confirmLabel="Quitar"
//     pendingLabel="Quitando…" pending={pending} onConfirm={remove} onCancel={close} />
// cancelLabel y confirmVariant son opcionales (por defecto "Cancelar" y botón rojo).

import { useId } from 'react';
import Button from './Button';
import Dialog from './Dialog';
import { useT } from '../i18n/LanguageContext';

export default function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel,
  cancelLabel = 'Cancelar',
  confirmVariant = 'danger',
  pendingLabel,
  pending = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const t = useT();

  return (
    // Mientras espera no se puede cerrar: así no queda una operación "suelta".
    <Dialog open={open} onClose={pending ? () => {} : onCancel} labelledBy={titleId}>
      <h2 id={titleId} className="dialog__title">
        {t(title)}
      </h2>
      <p className="dialog__text">{t(text)}</p>
      <div className="dialog__actions">
        {/* El foco arranca en "Cancelar", la opción segura */}
        <Button variant="secondary" size="sm" autoFocus disabled={pending} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} size="sm" pending={pending} onClick={onConfirm}>
          {pending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
