// Una sección del perfil en su propia ruta (/perfil/tema, /perfil/ayuda…).
// En celular es la forma de abrir cada sección; en escritorio sirve para los links del menú de la cuenta.

import { Link, Navigate, useParams } from 'react-router-dom';
import AccountSection from '../components/AccountSection';
import GenresSection from '../components/GenresSection';
import HelpSection from '../components/HelpSection';
import PrivacySection from '../components/PrivacySection';
import ReportSection from '../components/ReportSection';
import ThemeSection from '../components/ThemeSection';
import './ProfileSectionPage.css';

const SECTIONS = {
  cuenta: AccountSection,
  tema: ThemeSection,
  generos: GenresSection,
  privacidad: PrivacySection,
  ayuda: HelpSection,
  reportar: ReportSection,
};

export default function ProfileSectionPage() {
  const { section } = useParams();
  const Section = SECTIONS[section];

  // Una sección que no existe vuelve al perfil.
  if (!Section) return <Navigate to="/perfil" replace />;

  return (
    <div className="profile-section-page page">
      <Link to="/perfil" className="profile-section-page__back">
        <span aria-hidden="true">←</span> Perfil y ajustes
      </Link>
      <Section />
    </div>
  );
}
