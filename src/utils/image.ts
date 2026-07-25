/** Foto comprimida pronta para enviar (base64 sem prefixo + mimeType). */
export interface CompressedImage {
  data: string;
  mimeType: string;
}

const MAX_DIM = 1280; // px — recibo/nota fica legível e leve
const QUALITY = 0.72;

/**
 * Reduz e comprime uma imagem no navegador (canvas → JPEG) para caber com folga
 * no limite de corpo da Vercel (~4,5 MB) e não pesar o banco. Retorna base64.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D não disponível.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  if ('close' in bitmap) (bitmap as ImageBitmap).close();

  const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
  return {
    data: dataUrl.slice(dataUrl.indexOf(',') + 1),
    mimeType: 'image/jpeg',
  };
}

/** Carrega o arquivo como bitmap (createImageBitmap com fallback via <img>). */
async function loadBitmap(
  file: File,
): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // cai no fallback
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Falha ao ler a imagem.'));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}
