// Chip de estado: "Escuchado" (celeste) o "Pendiente" (amarillo).

import { STATUS } from '../services/library';
import { useT } from '../i18n/LanguageContext';

export default function StatusChip({ status }) {
  const t = useT();
  const listened = status === STATUS.LISTENED;
  return (
    <span className={`chip status-chip ${listened ? 'chip--listened' : 'chip--pending'}`}>
      {listened ? t('Escuchado') : t('Pendiente')}
    </span>
  );
}
