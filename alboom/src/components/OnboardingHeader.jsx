// Barra de la primera vez: logo + "Paso N de 3" con barra de progreso.

import Logo from './Logo';
import './OnboardingHeader.css';

const STEPS = [1, 2, 3];

export default function OnboardingHeader({ step }) {
  return (
    <header className="onboarding-header">
      <div className="page onboarding-header__inner">
        <Logo />
        <div className="onboarding-header__progress">
          <span className="onboarding-header__label">
            <span className="onboarding-header__word">Paso </span>
            {step} de 3
          </span>
          <div
            className="onboarding-header__bars"
            role="progressbar"
            aria-label="Progreso de la primera vez"
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={step}
          >
            {STEPS.map((n) => (
              <span key={n} className={`onboarding-header__bar${n <= step ? ' onboarding-header__bar--done' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
