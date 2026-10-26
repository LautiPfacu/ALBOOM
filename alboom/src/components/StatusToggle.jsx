// Segmentado "Escuchado / Pendiente" de la página de disco.

import { STATUS } from '../services/library';
import { useT } from '../i18n/LanguageContext';
import './StatusToggle.css';

const OPTIONS = [
  { value: STATUS.LISTENED, label: 'Escuchado' },
  { value: STATUS.PENDING, label: 'Pendiente' },
];

export default function StatusToggle({ value, onChange, disabled = false }) {
  const t = useT();
  return (
    <div className="status-toggle" role="group" aria-label={t('Estado del disco')}>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className="status-toggle__option"
          aria-pressed={value === option.value}
          disabled={disabled}
          onClick={() => option.value !== value && onChange(option.value)}
        >
          {t(option.label)}
        </button>
      ))}
    </div>
  );
}
