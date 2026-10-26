// Ayudas compartidas para escribir en Firestore desde los servicios nuevos (perfiles, seguir, posteos).
//
// Sin conexión, Firestore deja la escritura en cola y la promesa nunca termina. Por eso cortamos
// antes si no hay internet y ponemos 10 s de máximo: así la interfaz puede mostrar el error.

const WRITE_TIMEOUT_MS = 10_000;

// options: { cause } para conservar el error original
export class AppError extends Error {
  constructor(code, message, options) {
    super(message ?? code, options);
    this.code = code;
  }
}

// operation: función que devuelve la promesa de la escritura (por ejemplo, () => batch.commit())
export async function safeWrite(operation) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new AppError('app/offline');
  }
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new AppError('app/timeout')), WRITE_TIMEOUT_MS);
  });
  try {
    return await Promise.race([operation(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

const MESSAGES = {
  'app/offline': 'Sin conexión. Revisá internet y probá de nuevo.',
  'app/timeout': 'Firestore tardó demasiado en responder. Revisá tu conexión.',
  'permission-denied': 'No tenés permiso para hacer esto. Volvé a iniciar sesión.',
  unavailable: 'Firestore no está disponible en este momento. Probá de nuevo.',
  'not-found': 'Esto ya no existe.',
};

export function writeErrorMessage(error, fallback = 'No pudimos guardar el cambio. Probá de nuevo.') {
  return MESSAGES[error?.code] ?? fallback;
}

// Firestore acepta hasta 30 valores en un filtro "in": partimos las listas largas.
export function chunk(list, size = 30) {
  const parts = [];
  for (let i = 0; i < list.length; i += size) parts.push(list.slice(i, i + size));
  return parts;
}
