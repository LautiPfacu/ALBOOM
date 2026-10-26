// Perfil → Privacidad y seguridad.
// Interruptores de privacidad, contraseña, Google, cerrar sesión, descargar datos y eliminar cuenta.
// ("Cerrar sesión en todos" necesita el Admin SDK en un servidor: es opcional y no está en esta versión.)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useT } from "../i18n/LanguageContext";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { logout } from "../services/auth";
import {
  connectGoogle,
  DEFAULT_SETTINGS,
  disconnectGoogle,
  exportUserData,
  profileErrorMessage,
  providerIds,
  updateSettings,
} from "../services/profile";
import Button from "./Button";
import DeleteAccountDialog from "./DeleteAccountDialog";
import PasswordDialog from "./PasswordDialog";
import ProfileSection from "./ProfileSection";
import "./PrivacySection.css";

export default function PrivacySection() {
  const t = useT();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const settings = { ...DEFAULT_SETTINGS, ...profile?.settings };

  // providerData no avisa cuando cambia: guardamos la lista y la actualizamos después de conectar/desconectar.
  const [providers, setProviders] = useState(() => providerIds(user));
  const hasPassword = providers.includes("password");
  const hasGoogle = providers.includes("google.com");

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const settingsAction = useAsyncAction((next) =>
    updateSettings(user.uid, next),
  );
  const googleAction = useAsyncAction(() =>
    hasGoogle ? disconnectGoogle() : connectGoogle(),
  );
  const logoutAction = useAsyncAction(logout);
  const exportAction = useAsyncAction(() => exportUserData(user.uid));

  // El link de descarga usa memoria del navegador: lo liberamos al cambiarlo o al salir.
  useEffect(() => {
    if (!downloadUrl) return undefined;
    return () => URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  async function toggleSetting(key) {
    try {
      await settingsAction.run({ ...settings, [key]: !settings[key] });
    } catch (error) {
      showToast({ type: "error", message: profileErrorMessage(error) });
    }
  }

  async function handleGoogle() {
    try {
      await googleAction.run();
      setProviders(providerIds(user));
      showToast({
        type: "success",
        message: hasGoogle
          ? "Desconectaste tu cuenta de Google."
          : "Conectaste tu cuenta de Google.",
      });
    } catch (error) {
      showToast({ type: "error", message: profileErrorMessage(error) });
    }
  }

  async function handleLogout() {
    try {
      await logoutAction.run();
      navigate("/login", { replace: true });
    } catch {
      showToast({
        type: "error",
        message: "No pudimos cerrar la sesión. Probá de nuevo.",
      });
    }
  }

  async function handleExport() {
    try {
      const blob = await exportAction.run();
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (error) {
      showToast({ type: "error", message: profileErrorMessage(error) });
    }
  }

  let googleDescription = "Conectala para poder entrar también con Google.";
  if (hasGoogle) {
    googleDescription = hasPassword
      ? "Tu cuenta de Google está conectada. Podés entrar con ella."
      : "Es tu única forma de entrar, así que no se puede desconectar.";
  }

  return (
    <ProfileSection id="privacidad" title={t("Privacidad y seguridad")}>
      <div className="privacy-section__rows">
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__title" id="setting-public-reviews">
              {t("Mostrar mis reseñas nuevas en la comunidad")}
            </span>
            <span className="setting-row__description">
              {t("Podés cambiarlo en cada reseña.")}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            className="switch"
            aria-checked={settings.publicReviewsDefault}
            aria-labelledby="setting-public-reviews"
            disabled={settingsAction.pending}
            onClick={() => toggleSetting("publicReviewsDefault")}
          />
        </div>

        {/* "Perfil público" queda oculto por ahora: todos los perfiles son públicos (README de Comunidad). */}
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__title" id="setting-post-listened">
              {t("Publicar cuando marco un disco como escuchado")}
            </span>
            <span className="setting-row__description">
              {t(
                "Aparece «escuchó» en la comunidad para la gente que te sigue.",
              )}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            className="switch"
            aria-checked={settings.postListened}
            aria-labelledby="setting-post-listened"
            disabled={settingsAction.pending}
            onClick={() => toggleSetting("postListened")}
          />
        </div>

        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__title">{t("Contraseña")}</span>
            <span className="setting-row__description">
              {t(
                hasPassword
                  ? "Cambiala si creés que alguien más la conoce."
                  : "Entrás con Google, así que no tenés contraseña en ALBOOM.",
              )}
            </span>
          </div>
          {hasPassword && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPasswordOpen(true)}
            >
              Cambiar contraseña
            </Button>
          )}
        </div>

        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__title">Google</span>
            <span className="setting-row__description">
              {t(googleDescription)}
            </span>
          </div>
          {(!hasGoogle || hasPassword) && (
            <Button
              variant="secondary"
              size="sm"
              pending={googleAction.pending}
              onClick={handleGoogle}
            >
              {hasGoogle ? "Desconectar" : "Conectar"}
            </Button>
          )}
        </div>

        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__title">{t("Sesión")}</span>
            <span className="setting-row__description">
              {t("Cerrá la sesión en este dispositivo.")}
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            pending={logoutAction.pending}
            onClick={handleLogout}
          >
            {logoutAction.pending ? "Cerrando…" : "Cerrar sesión"}
          </Button>
        </div>

        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__title">{t("Tus datos")}</span>
            <span className="setting-row__description">
              {t(
                "Descargá tu biblioteca, tus puntajes y tus reseñas en un archivo.",
              )}
            </span>
          </div>
          {downloadUrl ? (
            <a
              href={downloadUrl}
              download="alboom-mis-datos.json"
              className="btn btn--primary btn--sm"
            >
              {t("Guardar archivo")}
            </a>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              pending={exportAction.pending}
              onClick={handleExport}
            >
              {exportAction.pending ? "Preparando…" : "Descargar"}
            </Button>
          )}
        </div>
      </div>

      <div className="privacy-section__danger">
        <div className="setting-row__text">
          <span className="privacy-section__danger-title">
            {t("Eliminar cuenta")}
          </span>
          <span className="setting-row__description privacy-section__danger-text">
            {t(
              "Se borran tu biblioteca, tus puntajes y tus reseñas. No se puede deshacer.",
            )}
          </span>
        </div>
        <button
          type="button"
          className="privacy-section__danger-button"
          onClick={() => setDeleteOpen(true)}
        >
          {t("Eliminar mi cuenta")}
        </button>
      </div>

      <PasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onDone={() => {
          setPasswordOpen(false);
          showToast({ type: "success", message: "Cambiaste tu contraseña." });
        }}
      />
      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </ProfileSection>
  );
}
