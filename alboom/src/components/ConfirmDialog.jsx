// Confirmación antes de una acción que no se puede deshacer (por ejemplo, quitar un disco).
//
//   <ConfirmDialog open={open} title="¿Quitar X?" text="…" confirmLabel="Quitar"
//     pendingLabel="Quitando…" pending={pending} onConfirm={remove} onCancel={close} />

import { useId } from 'react';
import Button from './Button';
import Dialog from './Dialog';

export default function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel,
  pendingLabel,
  pending = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();

  return (
    // Mientras espera no se puede cerrar: así no queda una operación "suelta".
    <Dialog open={open} onClose={pending ? () => {} : onCancel} labelledBy={titleId}>
      <h2 id={titleId} className="dialog__title">
        {title}
      </h2>
      <p className="dialog__text">{text}</p>
      <div className="dialog__actions">
        {/* El foco arranca en "Cancelar", la opción segura */}
        <Button variant="secondary" size="sm" autoFocus disabled={pending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="danger" size="sm" pending={pending} onClick={onConfirm}>
          {pending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
