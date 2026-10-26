// Selector de idioma: Español / English.

import { LANGUAGES } from '../i18n/language';
import { useLanguage } from '../i18n/LanguageContext';
import './LanguageSwitcher.css';

export default function LanguageSwitcher({ className = '' }) {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className={`segmented language-switcher ${className}`} role="group" aria-label={t('Idioma')}>
      {LANGUAGES.map((option) => (
        <button
          key={option.id}
          type="button"
          className="segmented__option"
          aria-pressed={language === option.id}
          lang={option.id}
          onClick={() => changeLanguage(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
