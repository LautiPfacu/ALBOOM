// Prepara la foto de perfil en el navegador: la recorta cuadrada (centrada), la achica a 256 px
// y la comprime en JPEG. Queda en unos 20-30 KB, así entra cómoda en un documento de Firestore.
// Usa createImageBitmap y OffscreenCanvas: dibujan en memoria, sin tocar el DOM de la página.

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB: límite del archivo original
const SIZE = 256;
const QUALITY = 0.82;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export class PhotoError extends Error {}

// Archivo de imagen → "data:image/jpeg;base64,…"
export async function preparePhoto(file) {
  if (!ACCEPTED.includes(file.type)) throw new PhotoError('Elegí una imagen JPG, PNG o WebP.');
  if (file.size > MAX_PHOTO_BYTES) throw new PhotoError('La imagen pesa más de 5 MB. Probá con una más liviana.');

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new PhotoError('No pudimos leer esa imagen. Probá con otra.');
  }

  // Recorte cuadrado desde el centro
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = new OffscreenCanvas(SIZE, SIZE);
  const context = canvas.getContext('2d');
  context.drawImage(bitmap, sx, sy, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: QUALITY });
  return blobToDataUrl(blob);
}

// FileReader convierte el archivo comprimido en texto (data URL) para guardarlo en Firestore.
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new PhotoError('No pudimos procesar la imagen.'));
    reader.readAsDataURL(blob);
  });
}
