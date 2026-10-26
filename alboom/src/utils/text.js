// Ayudas para textos: comparar sin tildes, fechas y plurales en el idioma elegido.

import { getLanguage, translate } from '../i18n/language';

const locale = () => (getLanguage() === 'en' ? 'en-US' : 'es-AR');

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

// "1 disco" / "3 discos" (en inglés, "1 album" / "3 albums": la palabra pasa por el diccionario)
export function plural(count, singular, pluralWord = `${singular}s`) {
  return `${count} ${translate(count === 1 ? singular : pluralWord)}`;
}

// Timestamp de Firestore o Date → "17 oct 2026"
export function formatDate(value) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', year: 'numeric' })
    .format(date)
    .replace(/\./g, '')
    .replace(/ de /g, ' ');
}

// "octubre de 2026"
export function formatMonthYear(value) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric' }).format(date);
}

// Hace cuánto: "hace 2 días", "hace 1 semana" (o "2 days ago" en inglés)
const UNITS = [
  { es: ['año', 'años'], en: ['year', 'years'], size: 31536000 },
  { es: ['mes', 'meses'], en: ['month', 'months'], size: 2592000 },
  { es: ['semana', 'semanas'], en: ['week', 'weeks'], size: 604800 },
  { es: ['día', 'días'], en: ['day', 'days'], size: 86400 },
  { es: ['hora', 'horas'], en: ['hour', 'hours'], size: 3600 },
  { es: ['minuto', 'minutos'], en: ['minute', 'minutes'], size: 60 },
];

export function timeAgo(value) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : value;
  if (!(date instanceof Date)) return '';
  const english = getLanguage() === 'en';
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  for (const unit of UNITS) {
    const amount = Math.floor(seconds / unit.size);
    if (amount < 1) continue;
    const [one, many] = english ? unit.en : unit.es;
    const word = amount === 1 ? one : many;
    return english ? `${amount} ${word} ago` : `hace ${amount} ${word}`;
  }
  return english ? 'just now' : 'recién';
}

// ["el rock", "el pop", "el indie"] → "el rock, el pop y el indie"
export function joinList(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${getLanguage() === 'en' ? 'and' : 'y'} ${items.at(-1)}`;
}
