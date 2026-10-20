// Diálogo modal con <dialog> nativo: showModal() atrapa el foco y Escape lo cierra.
// Es la única manipulación del DOM permitida (README V1, sección 5), mediante useRef.
//
//   <Dialog open={open} onClose={close} labelledBy="titulo-id">…</Dialog>
// El contenido solo se monta mientras está abierto, así su estado arranca de cero cada vez.

import { useEffect, useRef } from 'react';
import './Dialog.css';

export default function Dialog({ open, onClose, labelledBy, className = '', children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleCancel(event) {
    // Escape: avisamos al padre en lugar de dejar que el navegador lo cierre solo.
    event.preventDefault();
    onClose();
  }

  function handleClick(event) {
    // Un clic en el fondo (fuera de la caja) llega con target = el propio <dialog>.
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={`dialog ${className}`}
      aria-labelledby={labelledBy}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      {open && <div className="dialog__box">{children}</div>}
    </dialog>
  );
}
