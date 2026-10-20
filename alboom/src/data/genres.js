// Géneros de ALBOOM: 393 géneros en 20 familias (generos.json) y ayudas para buscarlos.

import data from './generos.json';
import { normalizeText } from '../utils/text';

export const FAMILIES = data.familias;
export const MIN_GENRES = 3; // mínimo para la primera vez y para editar géneros
export const TOTAL_GENRES = data.total;

// Lista plana con la familia de cada género: { id, nombre, spotify, familyId }
export const ALL_GENRES = FAMILIES.flatMap((family) =>
  family.generos.map((genre) => ({ ...genre, familyId: family.id })),
);

const GENRES_BY_ID = new Map(ALL_GENRES.map((genre) => [genre.id, genre]));

export function getGenre(id) {
  return GENRES_BY_ID.get(id);
}

export function genreName(id) {
  return GENRES_BY_ID.get(id)?.nombre ?? id;
}

// Busca por nombre sin importar tildes ni mayúsculas ("chamame" encuentra "Chamamé").
export function searchGenres(query) {
  const needle = normalizeText(query.trim());
  if (!needle) return [];
  return ALL_GENRES.filter((genre) => normalizeText(genre.nombre).includes(needle));
}

// Los 12 de la primera vez (pantalla 2). label es el nombre corto que se muestra en la tarjeta.
export const ONBOARDING_GENRES = [
  { id: 'rock-nacional', label: 'Rock nacional' },
  { id: 'pop', label: 'Pop' },
  { id: 'indie-rock', label: 'Indie' },
  { id: 'rock-psicodelico', label: 'Psicodelia' },
  { id: 'urbano-latino', label: 'Urbano latino' },
  { id: 'hip-hop', label: 'Hip hop' },
  { id: 'soul', label: 'R&B y soul' },
  { id: 'electro', label: 'Electrónica' },
  { id: 'jazz', label: 'Jazz' },
  { id: 'rock-clasico', label: 'Rock clásico' },
  { id: 'folk', label: 'Folk' },
  { id: 'heavy-metal', label: 'Metal' },
];

// Chips "Populares" de Explorar (pantalla 7).
export const POPULAR_GENRE_IDS = [
  'tango',
  'cumbia',
  'cuarteto',
  'salsa',
  'folklore-argentino',
  'trap-latino',
  'jazz',
  'electro',
];

// ---------- Tema sugerido según los géneros (README V2, sección 5) ----------

const THEME_BY_FAMILY = {
  pop: 'historieta',
  urbano: 'historieta',
  tropical: 'historieta',
  brasil: 'historieta',
  reggae: 'historieta',
  rock: 'garage',
  punk: 'garage',
  metal: 'garage',
  blues: 'garage',
  electronica: 'psicodelia',
  experimental: 'psicodelia',
  rnb: 'medianoche',
  jazz: 'medianoche',
  folk: 'medianoche',
  clasica: 'medianoche',
  'tango-folklore': 'medianoche',
};

// Géneros que van a un tema distinto del de su familia.
const THEME_BY_GENRE = {
  'indie-rock': 'historieta',
  'indie-pop': 'historieta',
  'indie-folk': 'historieta',
  'rock-psicodelico': 'psicodelia',
  'folk-psicodelico': 'psicodelia',
};

function themeForGenre(id) {
  const genre = getGenre(id);
  if (!genre) return null;
  return THEME_BY_GENRE[id] ?? THEME_BY_FAMILY[genre.familyId] ?? null;
}

// Cuenta cuántos géneros elegidos caen en cada tema y devuelve el de más coincidencias.
// → { theme: 'garage', reasons: ['Rock nacional', 'Metal'] }
export function suggestTheme(genreIds) {
  const counts = { historieta: 0, garage: 0, psicodelia: 0, medianoche: 0 };
  for (const id of genreIds) {
    const theme = themeForGenre(id);
    if (theme) counts[theme] += 1;
  }
  // Historieta va primero: gana los empates y es el tema si no hay coincidencias.
  const theme = Object.keys(counts).reduce((best, current) =>
    counts[current] > counts[best] ? current : best,
  );
  const reasons = genreIds.filter((id) => themeForGenre(id) === theme).map(genreName);
  return { theme, reasons };
}
