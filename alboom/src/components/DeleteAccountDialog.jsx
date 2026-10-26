// Eliminar cuenta: hay que escribir ELIMINAR y (si entra con email) la contraseña.
// Después: reautenticación → borrado de biblioteca, reseñas, usuario y perfil → deleteUser.

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useT } from "../i18n/LanguageContext";
import { useAsyncAction } from "../hooks/useAsyncAction";
import {
  deleteAccount,
  profileErrorMessage,
  providerIds,
} from "../services/profile";
import Button from "./Button";
import Dialog from "./Dialog";
import TextField from "./TextField";

const CONFIRM_WORD = "ELIMINAR";

export default function DeleteAccountDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="delete-dialog-title">
      <DeleteAccountForm onClose={onClose} />
    </Dialog>
  );
}

function DeleteAccountForm({ onClose }) {
  const t = useT();
  const { user } = useAuth();
  const usesPassword = providerIds(user).includes("password");
  const [word, setWord] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { run, pending } = useAsyncAction(() =>
    deleteAccount(user.uid, password),
  );

  const ready = word === CONFIRM_WORD && (!usesPassword || password.length > 0);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!ready) return;
    setError(null);
    try {
      // Al borrar el usuario, Firebase cierra la sesión y ProtectedRoute lleva al login.
      await run();
    } catch (deleteError) {
      setError(profileErrorMessage(deleteError));
    }
  }

  return (
    <form className="dialog__form" onSubmit={handleSubmit} noValidate>
      <h2 id="delete-dialog-title" className="dialog__title">
        {t("¿Eliminar tu cuenta?")}
      </h2>
      <p className="dialog__text">
        {t(
          "Se borran tu biblioteca, tus puntajes y tus reseñas. No se puede deshacer. Para confirmar, escribí",
        )}{" "}
        <strong>{CONFIRM_WORD}</strong>.
      </p>
      <TextField
        id="delete-word"
        label={t("Escribí {word}", { word: CONFIRM_WORD })}
        value={word}
        onChange={(event) => setWord(event.target.value.toUpperCase())}
        autoComplete="off"
        autoFocus
      />
      {usesPassword ? (
        <TextField
          id="delete-password"
          type="password"
          label="Tu contraseña"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      ) : (
        <p className="dialog__text">
          {t("Te vamos a pedir que entres con Google una vez más.")}
        </p>
      )}
      {error && (
        <p className="dialog__error" role="alert">
          {t(error)}
        </p>
      )}
      <div className="dialog__actions">
        <Button
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="danger"
          size="sm"
          pending={pending}
          disabled={!ready}
        >
          {pending ? "Eliminando…" : "Eliminar mi cuenta"}
        </Button>
      </div>
    </form>
  );
}
