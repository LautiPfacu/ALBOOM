// Primera vez, paso 3 (pantalla 4): elegir el tema. Se sugiere uno según los géneros elegidos.

import { THEMES, themeName } from '../data/themes';
import { useT } from '../i18n/LanguageContext';
import { joinList } from '../utils/text';
import Button from './Button';
import OnboardingFooter from './OnboardingFooter';
import ThemeCard from './ThemeCard';
import './ThemeStep.css';

export default function ThemeStep({ suggestion, theme, onChange, onBack, onFinish, saving, error, name }) {
  const t = useT();
  const reasons = joinList(suggestion.reasons.slice(0, 2).map((reason) => t('el {genre}', { genre: reason.toLowerCase() })));

  return (
    <>
      <main className="theme-step page">
        <div className="onboarding__intro">
          <h1 className="onboarding__title onboarding__title--md">{t('Elegí el color de tu ALBOOM')}</h1>
          <p className="onboarding__subtitle">
            {t('Te sugerimos')} <strong className="theme-step__suggested">{t(themeName(suggestion.theme))}</strong>
            {reasons && t(' por {reasons}', { reasons })}. {t('Lo podés cambiar cuando quieras desde el menú de tu cuenta.')}
          </p>
        </div>

        <div className="theme-step__grid" role="group" aria-label={t('Temas')}>
          {THEMES.map((option) => (
            <ThemeCard
              key={option.id}
              theme={option}
              selected={option.id === theme}
              onSelect={onChange}
              badge={option.id === suggestion.theme ? t('Sugerido para vos') : null}
              name={name}
            />
          ))}
        </div>
      </main>

      <OnboardingFooter
        start={
          <Button variant="secondary" size="md" onClick={onBack} disabled={saving}>
            ← Atrás
          </Button>
        }
      >
        {error && (
          <span className="theme-step__error" role="alert">
            {t(error)}
          </span>
        )}
        <Button size="lg" pending={saving} onClick={onFinish}>
          {saving ? 'Entrando…' : 'Entrar a ALBOOM'}
        </Button>
      </OnboardingFooter>
    </>
  );
}
