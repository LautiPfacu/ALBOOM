// Cuánto se parecen dos personas (para "Para vos" y "Gente con tus gustos").
// Se compara lo que eligió cada una: géneros y discos del Top 5.

import { genreName } from '../data/genres';
import { joinList } from './text';

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
    return sharedTop5.length === 1 ? 'Tiene 1 disco de tu Top 5' : `Tiene ${sharedTop5.length} discos de tu Top 5`;
  }
  if (sharedGenres.length > 0) {
    const names = sharedGenres.slice(0, 2).map((id) => `el ${genreName(id).toLowerCase()}`);
    return `Le ${sharedGenres.length === 1 ? 'gusta' : 'gustan'} ${joinList(names)}`;
  }
  return null;
}

// "Lo siguen Tomás y Juli" (con los nombres de personas que vos seguís).
export function followedByReason(names) {
  if (names.length === 0) return null;
  const first = names.slice(0, 2);
  const rest = names.length - first.length;
  return rest > 0 ? `Lo siguen ${first.join(', ')} y ${rest} más` : `Lo ${names.length === 1 ? 'sigue' : 'siguen'} ${joinList(first)}`;
}
