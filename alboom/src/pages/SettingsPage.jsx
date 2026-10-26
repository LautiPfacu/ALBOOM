// Perfil y ajustes (pantalla 10).
// Escritorio: tarjeta + menú de secciones con anclas a la izquierda, todas las secciones a la derecha.
// Celular: lista agrupada (Cuenta / La app / Ayuda) que abre cada sección en su ruta (/perfil/tema…).

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { themeName } from "../data/themes";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { useT } from "../i18n/LanguageContext";
import { logout } from "../services/auth";
import AccountSection from "../components/AccountSection";
import GenresSection from "../components/GenresSection";
import HelpSection from "../components/HelpSection";
import LanguageSwitcher from "../components/LanguageSwitcher";
import PrivacySection from "../components/PrivacySection";
import ProfileSummary from "../components/ProfileSummary";
import ThemeSection from "../components/ThemeSection";
import "./SettingsPage.css";

const SECTIONS = [
  { id: "cuenta", label: "Tu cuenta" },
  { id: "tema", label: "Tema de la app" },
  { id: "generos", label: "Tus géneros" },
  { id: "privacidad", label: "Privacidad y seguridad" },
  { id: "ayuda", label: "Ayuda" },
];

export default function SettingsPage() {
  const t = useT();
  const { profile } = useAuth();
  const { userTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { run: runLogout, pending: loggingOut } = useAsyncAction(logout);

  async function handleLogout() {
    try {
      await runLogout();
      navigate("/login", { replace: true });
    } catch {
      showToast({
        type: "error",
        message: "No pudimos cerrar la sesión. Probá de nuevo.",
      });
    }
  }

  // Grupos de la lista de celular
  const mobileGroups = [
    {
      title: "Cuenta",
      links: [
        { to: "/ajustes/cuenta", label: "Tus datos" },
        { to: "/ajustes/privacidad", label: "Privacidad y seguridad" },
      ],
    },
    {
      title: "La app",
      links: [
        { to: "/ajustes/tema", label: "Tema", value: themeName(userTheme) },
        {
          to: "/ajustes/generos",
          label: "Tus géneros",
          value: profile?.genres?.length ?? 0,
        },
        { label: "Idioma", control: <LanguageSwitcher /> },
      ],
    },
    {
      title: "Ayuda",
      links: [
        { to: "/ajustes/ayuda", label: "Preguntas frecuentes" },
        { to: "/ajustes/reportar", label: "Reportar un problema" },
      ],
    },
  ];

  return (
    <div className="profile page">
      <header className="page-header profile__header">
        <h1 className="page-header__title">{t("Perfil y ajustes")}</h1>
        <p className="page-header__subtitle">
          {t("Tus datos, el aspecto de la app, tu privacidad y la ayuda.")}
        </p>
      </header>

      {/* Escritorio */}
      <div className="profile__desktop">
        <aside className="profile__aside">
          <ProfileSummary />
          <nav className="profile__nav" aria-label={t("Secciones del perfil")}>
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="profile__nav-link"
              >
                {t(section.label)}
              </a>
            ))}
            <button
              type="button"
              className="profile__nav-logout"
              disabled={loggingOut}
              onClick={handleLogout}
            >
              {t(loggingOut ? "Cerrando sesión…" : "Cerrar sesión")}
            </button>
          </nav>
        </aside>
        <div className="profile__sections">
          <AccountSection />
          <ThemeSection />
          <GenresSection />
          <PrivacySection />
          <HelpSection />
        </div>
      </div>

      {/* Celular */}
      <div className="profile__mobile">
        <ProfileSummary compact />
        {mobileGroups.map((group) => (
          <div key={group.title} className="profile__group">
            <h2 className="label-caps profile__group-title">
              {t(group.title)}
            </h2>
            <ul className="profile__list">
              {group.links.map((link) =>
                link.control ? (
                  <li key={link.label} className="profile__list-link">
                    <span>{t(link.label)}</span>
                    {link.control}
                  </li>
                ) : (
                  <li key={link.to}>
                    <Link to={link.to} className="profile__list-link">
                      <span>{t(link.label)}</span>
                      <span className="profile__list-value">
                        {link.value !== undefined && link.value}
                        <span className="profile__chevron" aria-hidden="true">
                          ›
                        </span>
                      </span>
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
        <div className="profile__mobile-footer">
          <button
            type="button"
            className="text-link"
            disabled={loggingOut}
            onClick={handleLogout}
          >
            {t(loggingOut ? "Cerrando sesión…" : "Cerrar sesión")}
          </button>
          <span className="profile__version">ALBOOM 2.1</span>
        </div>
      </div>
    </div>
  );
}
