// Cuánto se parecen dos personas (para "Para vos" y "Gente con tus gustos").
// Se compara lo que eligió cada una: géneros y discos del Top 5.

import { genreName } from '../data/genres';
import { joinList } from './text';
import { translate } from '../i18n/language';

// → { score, sharedGenres: [ids], sharedTop5: [albums] }
export function affinityBetween(me, other) {
  const myGenres = new Set(me?.genres ?? []);
  const myTop5 = new Set((me?.top5 ?? []).map((album) => album.albumId));
  const sharedGenres = (other?.genres ?? []).filter((id) => myGenres.has(id));
  const sharedTop5 = (other?.top5 ?? []).filter((album) => myTop5.has(album.albumId));
  // Un disco del Top 5 en común pesa más que un género: es un gusto mucho más específico.
  return { score: sharedGenres.length + sharedTop5.length * 2, sharedGenres, sharedTop5 };
}

// Motivo en palabras: "Tiene 3 discos de tu Top 5", "Le gustan el indie y el R&B".
export function affinityReason({ sharedGenres, sharedTop5 }) {
  if (sharedTop5.length > 0) {
    return sharedTop5.length === 1
      ? translate('Tiene 1 disco de tu Top 5')
      : translate('Tiene {n} discos de tu Top 5', { n: sharedTop5.length });
  }
  if (sharedGenres.length > 0) {
    const names = sharedGenres.slice(0, 2).map((id) => translate('el {genre}', { genre: genreName(id).toLowerCase() }));
    return translate(sharedGenres.length === 1 ? 'Le gusta {list}' : 'Le gustan {list}', { list: joinList(names) });
  }
  return null;
}

// "Lo siguen Tomás y Juli" (con los nombres de personas que vos seguís).
export function followedByReason(names) {
  if (names.length === 0) return null;
  const first = names.slice(0, 2);
  const rest = names.length - first.length;
  if (rest > 0) return translate('Lo siguen {names} y {n} más', { names: first.join(', '), n: rest });
  return translate(names.length === 1 ? 'Lo sigue {names}' : 'Lo siguen {names}', { names: joinList(first) });
}
