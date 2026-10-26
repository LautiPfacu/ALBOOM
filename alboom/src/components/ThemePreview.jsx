// Vista previa de un tema (primera vez, paso 3, y Perfil → Tema de la app).
// Los colores salen de las mismas variables que usa la app: el contenedor lleva
// la clase theme-preview--{tema}, que define esas variables solo para la vista previa.
//
//   size: 'large' (276 px, con decoración y saludo) | 'small' (118 px)

import BurstMark from './BurstMark';
import './ThemePreview.css';
import { useT } from '../i18n/LanguageContext';

export default function ThemePreview({ themeId, size = 'large', name }) {
  const t = useT();
  const firstName = name ? name.split(' ')[0] : '';
  const withName = firstName ? `, ${firstName}` : '';
  // Historieta saluda con signos de exclamación, como en el diseño.
  const greeting = themeId === 'historieta' ? t('¡Hola{name}!', { name: withName }) : t('Hola{name}.', { name: withName });

  return (
    <div className={`theme-preview theme-preview--${themeId} theme-preview--${size}`} aria-hidden="true">
      <div className="theme-preview__decor" />
      <div className="theme-preview__brand">
        <BurstMark className="theme-preview__burst" />
        <span>ALBOOM</span>
      </div>
      {size === 'large' && (
        <>
          <span className="theme-preview__greeting">{greeting}</span>
          {themeId === 'historieta' && <span className="theme-preview__pop">POP!</span>}
          {themeId === 'garage' && <span className="theme-preview__tag">{t('LADO B · 03')}</span>}
          {themeId === 'medianoche' && (
            <span className="theme-preview__note">{t('Para escuchar con las luces apagadas.')}</span>
          )}
        </>
      )}
      <div className="theme-preview__bar">
        {size === 'large' ? (
          <span className="theme-preview__vinyls">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={`theme-preview__vinyl${n === 5 ? ' theme-preview__vinyl--empty' : ''}`} />
            ))}
          </span>
        ) : (
          <span className="theme-preview__dots">
            <span className="theme-preview__dot theme-preview__dot--card" />
            <span className="theme-preview__dot theme-preview__dot--accent" />
            <span className="theme-preview__dot theme-preview__dot--soft" />
          </span>
        )}
        <span className="theme-preview__button">{t('Guardar')}</span>
      </div>
    </div>
  );
}
