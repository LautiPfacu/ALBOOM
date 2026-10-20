// Caja de una sección del perfil: título, bajada opcional y contenido.

import './ProfileSection.css';

export default function ProfileSection({ id, title, subtitle, action, children }) {
  const titleId = `${id}-title`;
  return (
    <section id={id} className="profile-section" aria-labelledby={titleId}>
      <div className="profile-section__header">
        <div className="profile-section__heading">
          <h2 id={titleId} className="profile-section__title">
            {title}
          </h2>
          {subtitle && <p className="profile-section__subtitle">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
