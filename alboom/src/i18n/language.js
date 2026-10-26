// Idioma actual, accesible también fuera de React (por ejemplo, para formatear fechas en utils/text.js).
// Lo actualiza LanguageContext cada vez que la persona cambia de idioma.

import en from './en';

export const LANGUAGES = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'English' },
];

const STORAGE_KEY = 'alboom:language';
let current = readSaved();

function readSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch {
    // Sin localStorage seguimos en español.
  }
  // Predeterminado: español. Inglés solo si la persona lo eligió.
  return 'es';
}

export function getLanguage() {
  return current;
}

export function setLanguage(language) {
  current = language;
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // La preferencia igual vale para esta visita.
  }
}

// Traduce un texto. El texto en español es la "clave": en español se devuelve tal cual,
// en inglés se busca en el diccionario (si falta, queda en español).
// vars reemplaza {nombre} dentro del texto: translate('Hola, {name}.', { name: 'Sofi' })
export function translate(text, vars, language = current) {
  if (typeof text !== 'string') return text;
  const base = language === 'en' ? (en[text] ?? text) : text;
  if (!vars) return base;
  return base.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}
