// Perfil → Ayuda: buscador que filtra las preguntas, acordeón con <details>/<summary>,
// "Reportar un problema" y links a Términos y Privacidad.

import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FAQ } from "../data/faq";
import { useT } from "../i18n/LanguageContext";
import { normalizeText } from "../utils/text";
import ProfileSection from "./ProfileSection";
import "./HelpSection.css";

export default function HelpSection() {
  const t = useT();
  const [search, setSearch] = useState("");
  const searchId = useId();

  // Filtra por pregunta y respuesta, sin importar tildes.
  const questions = useMemo(() => {
    const needle = normalizeText(search.trim());
    if (!needle) return FAQ;
    return FAQ.filter((item) =>
      normalizeText(`${t(item.question)} ${t(item.answer)}`).includes(needle),
    );
  }, [search, t]);

  return (
    <ProfileSection id="ayuda" title={t("Ayuda")}>
      <div className="help-section__search">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <label htmlFor={searchId} className="visually-hidden">
          {t("Buscá en la ayuda")}
        </label>
        <input
          id={searchId}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("Buscá en la ayuda")}
          autoComplete="off"
        />
      </div>

      <div className="help-section__list">
        {questions.length === 0 && (
          <p className="help-section__empty">
            {t(
              "No encontramos nada con esa palabra. Probá con otra o reportá el problema.",
            )}
          </p>
        )}
        {questions.map((item, index) => (
          // La primera pregunta arranca abierta, como en el diseño.
          <details
            key={item.id}
            className="help-section__item"
            open={index === 0 && !search}
          >
            <summary className="help-section__question">
              <span>{t(item.question)}</span>
              <span className="help-section__icon" aria-hidden="true" />
            </summary>
            <p className="help-section__answer">{t(item.answer)}</p>
          </details>
        ))}
      </div>

      <div className="help-section__report">
        <div className="help-section__report-text">
          <span className="help-section__report-title">
            {t("¿Algo no funciona?")}
          </span>
          <span className="setting-row__description">
            {t("Contanos qué pasó y en qué pantalla. Te respondemos por mail.")}
          </span>
        </div>
        <Link to="/ajustes/reportar" className="btn btn--primary btn--md">
          {t("Reportar un problema")}
        </Link>
      </div>

      <div className="help-section__legal">
        <Link to="/terminos">{t("Términos y condiciones")}</Link>
        <Link to="/privacidad">{t("Política de privacidad")}</Link>
        <span>{t("ALBOOM versión {version}", { version: "2.1" })}</span>
      </div>
    </ProfileSection>
  );
}
