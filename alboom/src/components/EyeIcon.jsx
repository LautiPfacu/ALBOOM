// Ícono de ojo para el botón de la contraseña. crossed = ojo tachado.
// Es decorativo: el botón que lo contiene tiene su propio aria-label.

export default function EyeIcon({ crossed = false, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {crossed && <path d="M4 20 20 4" />}
    </svg>
  );
}
