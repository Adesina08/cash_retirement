export type OcrEngine = 'text-detector' | 'unavailable';

export interface OcrResult {
  text: string;
  warnings: string[];
  engine: OcrEngine;
}

const supportsTextDetector = () => typeof window !== 'undefined' && Boolean(window.TextDetector);

/**
 * Attempts to extract text from an image using browser-native capabilities.
 * Falls back to returning warnings when OCR engines are not available.
 */
export async function runLocalOcr(file: File): Promise<OcrResult> {
  const warnings: string[] = [];

  if (typeof window === 'undefined') {
    warnings.push('OCR is only available in the browser runtime.');
    return { text: '', warnings, engine: 'unavailable' };
  }

  if (!file.type.startsWith('image/')) {
    warnings.push('OCR currently supports image formats. Convert PDFs to images to extract text automatically.');
    return { text: '', warnings, engine: 'unavailable' };
  }

  if (!supportsTextDetector()) {
    warnings.push(
      'Your browser does not expose a built-in OCR engine. The receipt was uploaded successfully, but text extraction is unavailable.'
    );
    return { text: '', warnings, engine: 'unavailable' };
  }

  try {
    const detector = new window.TextDetector!();
    const bitmap = await createImageBitmap(file);
    try {
      const matches = await detector.detect(bitmap);
      const extracted = matches.map((match) => match.rawValue).join('\n').trim();
      if (!extracted) {
        warnings.push('No text could be detected on this receipt. Try increasing the contrast or uploading a clearer image.');
      }
      return { text: extracted, warnings, engine: 'text-detector' };
    } finally {
      if ('close' in bitmap) {
        bitmap.close();
      }
    }
  } catch (error) {
    warnings.push(
      error instanceof Error
        ? error.message
        : 'The browser OCR engine threw an unexpected error while processing this image.'
    );
    return { text: '', warnings, engine: 'text-detector' };
  }
}
