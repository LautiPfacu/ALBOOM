// Barra de abajo de la primera vez: a la izquierda texto o "← Atrás", a la derecha las acciones.

import './OnboardingFooter.css';

export default function OnboardingFooter({ start, children }) {
  return (
    <footer className="onboarding-footer">
      <div className="page onboarding-footer__inner">
        <div className="onboarding-footer__start">{start}</div>
        <div className="onboarding-footer__actions">{children}</div>
      </div>
    </footer>
  );
}
