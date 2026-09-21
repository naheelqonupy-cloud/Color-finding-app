export type CameraMode = 'NORMAL' | 'FIND_COLOR';

export interface RgbColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface LabColor {
  l: number; // 0-100 (Lightness)
  a: number; // -128 to 127 (Green to Red)
  b: number; // -128 to 127 (Blue to Yellow)
}

export interface SelectedColorData {
  rgb: RgbColor;
  lab: LabColor;
  hex: string;
  name?: string;
  confidence: number;
}

export interface TouchLoupeState {
  active: boolean;
  screenX: number;
  screenY: number;
  normalizedX: number; // 0.0 to 1.0 in camera coordinate space
  normalizedY: number; // 0.0 to 1.0 in camera coordinate space
  currentColor: SelectedColorData | null;
  sampleBuffer: ImageData | null;
}

export interface FilterSettings {
  specificity: number; // 1 to 100 (low = loose/tolerant, high = strict)
  saturation: number;  // 0.0 to 2.5 (1.0 = normal)
  morphologicalSmoothing: boolean; // 3x3 spatial filter enabled
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  mode: CameraMode;
  targetColorHex: string | null;
}
