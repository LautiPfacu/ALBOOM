// Canciones del disco. Si tiene más de un CD, agrega "Disco 1", "Disco 2"…
// En celular muestra 5 y el botón "Ver las N canciones".

import { useMemo, useState } from 'react';
import { formatAlbumDuration, formatTrackDuration } from '../services/spotify';
import './TrackList.css';

const MOBILE_PREVIEW = 5;

export default function TrackList({ tracks, durationMs }) {
  const [expanded, setExpanded] = useState(false);

  // Agrupamos por número de disco: [[1, [...]], [2, [...]]]
  const discs = useMemo(() => {
    const groups = new Map();
    for (const track of tracks) {
      const disc = track.disc ?? 1;
      if (!groups.has(disc)) groups.set(disc, []);
      groups.get(disc).push(track);
    }
    return [...groups.entries()];
  }, [tracks]);

  // Posición de cada canción en toda la lista, para saber cuáles ocultar en celular.
  const positionById = useMemo(() => new Map(tracks.map((track, i) => [track.id, i])), [tracks]);

  return (
    <section
      className={`track-list${expanded ? ' track-list--expanded' : ''}`}
      aria-labelledby="tracks-title"
    >
      <div className="track-list__header">
        <h2 id="tracks-title" className="track-list__title">
          Canciones
        </h2>
        <span className="track-list__summary">
          {tracks.length} · {formatAlbumDuration(durationMs)}
        </span>
      </div>
      {discs.map(([disc, discTracks]) => (
        <div key={disc} className="track-list__disc">
          {discs.length > 1 && <h3 className="track-list__disc-title">Disco {disc}</h3>}
          <ol className="track-list__items">
            {discTracks.map((track) => (
              <li
                key={track.id}
                className={`track-list__item${positionById.get(track.id) >= MOBILE_PREVIEW ? ' track-list__item--extra' : ''}`}
              >
                <span className="track-list__number">{track.number}</span>
                <span className="track-list__name">{track.name}</span>
                <span className="track-list__duration">{formatTrackDuration(track.durationMs)}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
      {tracks.length > MOBILE_PREVIEW && (
        <button type="button" className="text-link track-list__toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Ver menos' : `Ver las ${tracks.length} canciones`}
        </button>
      )}
    </section>
  );
}
