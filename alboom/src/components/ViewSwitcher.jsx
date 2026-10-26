// Segmentado "Grande / Chica / Lista" con íconos (en celular, solo íconos).

import { useT } from '../i18n/LanguageContext';

const VIEWS = [
  {
    id: 'grande',
    label: 'Grande',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1.5" y="1.5" width="5" height="5" />
        <rect x="9.5" y="1.5" width="5" height="5" />
        <rect x="1.5" y="9.5" width="5" height="5" />
        <rect x="9.5" y="9.5" width="5" height="5" />
      </svg>
    ),
  },
  {
    id: 'chica',
    label: 'Chica',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        {[1, 6.25, 11.5].flatMap((y) =>
          [1, 6.25, 11.5].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="3.5" height="3.5" />),
        )}
      </svg>
    ),
  },
  {
    id: 'lista',
    label: 'Lista',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="1.5" width="3.5" height="3.5" />
        <rect x="6.5" y="2.4" width="8.5" height="1.8" />
        <rect x="1" y="6.25" width="3.5" height="3.5" />
        <rect x="6.5" y="7.1" width="8.5" height="1.8" />
        <rect x="1" y="11" width="3.5" height="3.5" />
        <rect x="6.5" y="11.9" width="8.5" height="1.8" />
      </svg>
    ),
  },
];

export default function ViewSwitcher({ value, onChange }) {
  const t = useT();
  return (
    <div className="segmented view-switcher" role="group" aria-label={t('Vista')}>
      {VIEWS.map((view) => (
        <button
          key={view.id}
          type="button"
          className="segmented__option view-switcher__option"
          aria-pressed={value === view.id}
          aria-label={t(view.label)}
          onClick={() => onChange(view.id)}
        >
          <span aria-hidden="true">{view.icon}</span>
          <span className="view-switcher__label" aria-hidden="true">
            {t(view.label)}
          </span>
        </button>
      ))}
    </div>
  );
}
