// Ayudas para textos: comparar sin tildes, fechas y plurales en español.

// "Chamamé" → "chamame"
export function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function words(text) {
  return normalizeText(text).split(/[^a-z0-9]+/).filter(Boolean);
}

// ¿Este disco tiene que ver con lo que se buscó?
// La búsqueda de Spotify es "difusa" y siempre devuelve algo, aunque no se parezca.
// Alcanza con que una palabra buscada empiece igual (4 letras) que una del nombre o del artista,
// así "ceratti" sigue encontrando a Cerati pero "ahsdhashdh" no trae nada.
export function matchesQuery(album, query) {
  const tokens = words(query).filter((token) => token.length >= 2);
  if (tokens.length === 0) return true;
  const albumWords = words(`${album.name} ${album.artist}`);
  return tokens.some((token) => {
    const prefix = token.slice(0, 4);
    return albumWords.some((word) => word.startsWith(prefix) || token.startsWith(word.slice(0, 4)));
  });
}

// "1 disco" / "3 discos"
export function plural(count, singular, pluralWord = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralWord}`;
}

// Timestamp de Firestore o Date → "17 oct 2026"
export function formatDate(value) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(date)
    .replace(/\./g, '')
    .replace(/ de /g, ' ');
}

// "octubre de 2026"
export function formatMonthYear(value) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(date);
}

// Hace cuánto: "hace 2 días", "hace 1 semana"
export function timeAgo(value) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : value;
  if (!(date instanceof Date)) return '';
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  const units = [
    ['año', 'años', 31536000],
    ['mes', 'meses', 2592000],
    ['semana', 'semanas', 604800],
    ['día', 'días', 86400],
    ['hora', 'horas', 3600],
    ['minuto', 'minutos', 60],
  ];
  for (const [one, many, size] of units) {
    const amount = Math.floor(seconds / size);
    if (amount >= 1) return `hace ${amount} ${amount === 1 ? one : many}`;
  }
  return 'recién';
}

// ["el rock", "el pop", "el indie"] → "el rock, el pop y el indie"
export function joinList(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items.at(-1)}`;
}
