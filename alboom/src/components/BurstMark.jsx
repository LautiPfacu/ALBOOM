// El estallido de ALBOOM (sin animar). Es el polígono #burst de design/ALBOOM Final v3.dc.html.
// Los colores salen de variables CSS: --ink (cuerpo), --pink (sombra) y --paper (agujero).

import './BurstMark.css';

const BURST_POINTS =
  '85.4,24.0 111.3,49.0 131.7,23.1 132.8,66.2 174.4,52.6 147.0,80.9 176.9,91.3 165.3,96.1 181.4,99.4 143.3,108.7 167.4,156.3 130.2,132.3 149.5,181.4 116.3,141.5 120.8,171.1 109.7,148.8 90.4,181.1 87.7,142.5 44.3,175.0 67.6,135.4 20.1,139.6 29.1,130.6 12.6,132.4 47.5,113.6 7.1,108.2 53.3,90.8 47.5,67.0 59.5,61.9 46.7,21.4 85.3,48.7';

export default function BurstMark({ className = '' }) {
  return (
    <svg className={`burst-mark ${className}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <polygon className="burst-mark__shadow" points={BURST_POINTS} transform="translate(8 6) rotate(9 100 100)" />
      <polygon className="burst-mark__body" points={BURST_POINTS} />
      <circle className="burst-mark__hole" cx="100" cy="100" r="8" />
    </svg>
  );
}
