// Chip de estado: "Escuchado" (celeste) o "Pendiente" (amarillo).

import { STATUS } from '../services/library';

export default function StatusChip({ status }) {
  const listened = status === STATUS.LISTENED;
  return (
    <span className={`chip status-chip ${listened ? 'chip--listened' : 'chip--pending'}`}>
      {listened ? 'Escuchado' : 'Pendiente'}
    </span>
  );
}
