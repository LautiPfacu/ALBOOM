// Los 4 temas de ALBOOM. Los colores viven en styles/themes.css; acá están los textos de cada tarjeta.

export const DEFAULT_THEME = 'historieta';

export const THEMES = [
  {
    id: 'historieta',
    name: 'Historieta',
    tags: 'Pop · Urbano · Indie',
    description: 'Todos los colores, como una revista de historietas.',
  },
  {
    id: 'garage',
    name: 'Garage',
    tags: 'Rock · Punk · Grunge',
    description: 'Fotocopia, recortes y rojo.',
  },
  {
    id: 'psicodelia',
    name: 'Psicodelia',
    tags: 'Psicodelia · Electrónica · Experimental',
    description: 'Violeta, salmón y rayos de luz.',
  },
  {
    id: 'medianoche',
    name: 'Medianoche',
    tags: 'Soul · R&B · Jazz',
    description: 'Negro de base, letras blancas y detalles en rosa.',
  },
];

export function themeName(id) {
  return THEMES.find((theme) => theme.id === id)?.name ?? 'Historieta';
}
