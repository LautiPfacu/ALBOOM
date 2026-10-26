// Cartel amarillo de coincidencia en el perfil de otra persona:
// "2 de 5 discos de su Top 5 también están en el tuyo, y coinciden en el rock nacional."
// Solo aparece si hay al menos un disco en común.

import { affinityBetween } from '../utils/affinity';
import { genreName } from '../data/genres';
import { joinList } from '../utils/text';
import './MatchBanner.css';

export default function MatchBanner({ me, them }) {
  const { sharedTop5, sharedGenres } = affinityBetween(me, them);
  if (sharedTop5.length === 0) return null;

  const total = them.top5?.length ?? 0;
  const genres = joinList(sharedGenres.slice(0, 2).map((id) => `el ${genreName(id).toLowerCase()}`));
  const albums = joinList(sharedTop5.map((album) => album.name));

  return (
    <aside className="match-banner" aria-label="Coincidencia de gustos">
      <span className="match-banner__number">
        {sharedTop5.length} de {total}
      </span>
      <p className="match-banner__text">
        <strong>discos de su Top 5 también están en el tuyo</strong>
        {genres && `, y coinciden en ${genres}`}. {albums}.
      </p>
    </aside>
  );
}
