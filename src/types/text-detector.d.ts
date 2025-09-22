export {};

declare global {
  interface DetectedText {
    rawValue: string;
    boundingBox: DOMRectReadOnly;
  }

  interface TextDetector {
    detect(image: CanvasImageSource): Promise<DetectedText[]>;
  }

  interface Window {
    TextDetector?: {
      new (): TextDetector;
    };
  }
}
