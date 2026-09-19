// Deno's Edge Runtime has no browser Canvas/createImageBitmap — the
// technique used for this exact purpose in the frontend (src/features/
// uploads/utils/imageCompression.ts) doesn't apply server-side. jimp is
// pure JS with no native bindings, which is why it works here; verified
// directly, including the non-obvious part — Jimp.read() needs a Node
// Buffer, not a raw Uint8Array, or it tries to interpret the bytes as a
// URL string and throws.
import { Jimp } from 'npm:jimp@1.6.0';
import { Buffer } from 'node:buffer';

const MAX_LONGEST_EDGE = 1568;
const JPEG_QUALITY = 85;

export async function prepareImageForClassification(
  bytes: Uint8Array,
  mimeType: string,
): Promise<{ bytes: Uint8Array; mimeType: string }> {
  try {
    const image = await Jimp.read(Buffer.from(bytes));
    const longestEdge = Math.max(image.width, image.height);

    if (longestEdge <= MAX_LONGEST_EDGE) {
      return { bytes, mimeType }; // already small enough — send as-is
    }

    const scale = MAX_LONGEST_EDGE / longestEdge;
    image.resize({ w: Math.round(image.width * scale), h: Math.round(image.height * scale) });
    const outBuffer = await image.getBuffer('image/jpeg', { quality: JPEG_QUALITY });
    return { bytes: new Uint8Array(outBuffer), mimeType: 'image/jpeg' };
  } catch {
    // jimp doesn't decode HEIC (no HEIC plugin in its default build) — a
    // genuine HEIC file can still reach here from a browser that could
    // preview it itself (Safari), since the upload page only converts HEIC
    // when the uploading browser *can't* decode it. Gemini documents native
    // HEIC/HEIF support, so passing the original bytes through unresized
    // still has a real shot at working rather than being an accepted gap —
    // just without this function's own downscaling, which isn't worth a
    // second image-decoding dependency for how narrow this case is.
    return { bytes, mimeType };
  }
}
