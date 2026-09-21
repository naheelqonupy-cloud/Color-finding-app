import { LabColor, RgbColor, SelectedColorData } from '../types';

/**
 * Standard CIE D65 Illuminant reference white points
 */
const Xn = 0.95047;
const Yn = 1.00000;
const Zn = 1.08883;

function sRgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, Math.round(v * 255)));
}

function labF(t: number): number {
  const delta = 6 / 29;
  return t > delta * delta * delta ? Math.cbrt(t) : t / (3 * delta * delta) + 4 / 29;
}

/**
 * Convert sRGB [0-255] to CIELAB [L*:0-100, a*:-128-127, b*:-128-127]
 */
export function rgbToLab(rgb: RgbColor): LabColor {
  const rLin = sRgbToLinear(rgb.r);
  const gLin = sRgbToLinear(rgb.g);
  const bLin = sRgbToLinear(rgb.b);

  // sRGB to CIEXYZ (D65)
  const x = rLin * 0.4124564 + gLin * 0.3575761 + bLin * 0.1804375;
  const y = rLin * 0.2126729 + gLin * 0.7151522 + bLin * 0.0721750;
  const z = rLin * 0.0193339 + gLin * 0.1191920 + bLin * 0.9503041;

  const fx = labF(x / Xn);
  const fy = labF(y / Yn);
  const fz = labF(z / Zn);

  const l = Math.max(0, Math.min(100, 116 * fy - 16));
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return { l, a, b };
}

/**
 * Perceptual color difference using CIE Delta E (CIE76 / CIE94 hybrid)
 * Human JND (Just Noticeable Difference) is approx ~2.3.
 */
export function deltaE(lab1: LabColor, lab2: LabColor): number {
  const dL = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;

  // Standard Euclidean distance in CIELAB space (CIE76)
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * CIE94 Delta E (improved perceptual uniformity for graphic arts/industrial color matching)
 */
export function deltaE94(lab1: LabColor, lab2: LabColor): number {
  const dL = lab1.l - lab2.l;
  const c1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
  const c2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
  const dC = c1 - c2;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  const dH2 = da * da + db * db - dC * dC;
  const dH = dH2 > 0 ? Math.sqrt(dH2) : 0;

  const sL = 1;
  const sC = 1 + 0.045 * c1;
  const sH = 1 + 0.015 * c1;

  const termL = dL / sL;
  const termC = dC / sC;
  const termH = dH / sH;

  return Math.sqrt(termL * termL + termC * termC + termH * termH);
}

export function rgbToHex(rgb: RgbColor): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

export function hexToRgb(hex: string): RgbColor {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  return {
    r: parseInt(cleanHex.slice(0, 2), 16) || 0,
    g: parseInt(cleanHex.slice(2, 4), 16) || 0,
    b: parseInt(cleanHex.slice(4, 6), 16) || 0,
  };
}

/**
 * Unified factory to construct a SelectedColorData target from a manual HEX string.
 * Uses identical sRGB -> CIEXYZ -> CIELAB color space transformation as camera sampling.
 */
export function createSelectedColorFromHex(hex: string): SelectedColorData | null {
  const cleanHex = hex.trim().replace(/^#/, '');
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return null;
  }
  const rgb = hexToRgb(cleanHex);
  const lab = rgbToLab(rgb);
  const formattedHex = rgbToHex(rgb);
  const name = approximateColorName(rgb);
  return {
    rgb,
    lab,
    hex: formattedHex,
    name,
    confidence: 1.0,
  };
}

export function createSelectedColorFromRgb(rgb: RgbColor): SelectedColorData {
  const clampedRgb: RgbColor = {
    r: Math.max(0, Math.min(255, Math.round(rgb.r))),
    g: Math.max(0, Math.min(255, Math.round(rgb.g))),
    b: Math.max(0, Math.min(255, Math.round(rgb.b))),
  };
  const lab = rgbToLab(clampedRgb);
  const hex = rgbToHex(clampedRgb);
  const name = approximateColorName(clampedRgb);
  return {
    rgb: clampedRgb,
    lab,
    hex,
    name,
    confidence: 1.0,
  };
}

// Pre-allocated reusable static arrays to eliminate GC churn and heap allocations during live sampling (21x21 = 441)
const MAX_SAMPLE_PIXELS = 1024;
const sRBuf = new Uint8Array(MAX_SAMPLE_PIXELS);
const sGBuf = new Uint8Array(MAX_SAMPLE_PIXELS);
const sBBuf = new Uint8Array(MAX_SAMPLE_PIXELS);
const sLumBuf = new Float32Array(MAX_SAMPLE_PIXELS);
const sWeightBuf = new Float32Array(MAX_SAMPLE_PIXELS);
const sIndices = new Int16Array(MAX_SAMPLE_PIXELS);

/**
 * Calculates a robust representative color from a 2D pixel buffer (e.g. 21x21).
 * Eliminates sensor noise, highlights, reflections, and deep shadows using:
 * 1. Filtering extreme highlights (specular reflections) and extreme dark noise
 * 2. 12% trimmed mean on luminance
 * 3. 2D Gaussian distance weighting centered on the target coordinate
 * Ultra-fast zero-allocation implementation for 60-120fps touch tracking.
 */
export function calculateRobustDominantColor(
  imageData: ImageData,
  sampleSize: number
): SelectedColorData {
  const { data, width, height } = imageData;
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const sigma = sampleSize / 3;
  const twoSigmaSq = 2 * sigma * sigma;

  let count = 0;
  const maxCap = Math.min(width * height, MAX_SAMPLE_PIXELS);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Relative luminance (Rec. 709)
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      // Filter extreme specular highlights (e.g. glare off plastic/glass)
      if (lum > 248 && (r > 245 || g > 245 || b > 245)) {
        continue;
      }
      // Filter extreme deep dark shadows / sensor floor noise
      if (lum < 6) {
        continue;
      }

      // Distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const distSq = dx * dx + dy * dy;
      const weight = Math.exp(-distSq / twoSigmaSq);

      if (count < maxCap) {
        sRBuf[count] = r;
        sGBuf[count] = g;
        sBBuf[count] = b;
        sLumBuf[count] = lum;
        sWeightBuf[count] = weight;
        sIndices[count] = count;
        count++;
      }
    }
  }

  // Fallback if all pixels were filtered out (e.g., completely black/white frame)
  if (count === 0) {
    const midIdx = (centerY * width + centerX) * 4;
    const r = data[midIdx] || 128;
    const g = data[midIdx + 1] || 128;
    const b = data[midIdx + 2] || 128;
    const rgb = { r, g, b };
    return {
      rgb,
      lab: rgbToLab(rgb),
      hex: rgbToHex(rgb),
      name: approximateColorName(rgb),
      confidence: 0.5,
    };
  }

  // Subarray index sorting (sorting indices only, no object allocations)
  const activeIndices = sIndices.subarray(0, count);
  activeIndices.sort((iA, iB) => sLumBuf[iA] - sLumBuf[iB]);

  const trimAmount = Math.floor(count * 0.12);
  const startIdx = trimAmount;
  const endIdx = count - trimAmount;

  // Compute weighted average
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let totalWeight = 0;

  for (let i = startIdx; i < endIdx; i++) {
    const pIdx = activeIndices[i];
    const w = sWeightBuf[pIdx];
    sumR += sRBuf[pIdx] * w;
    sumG += sGBuf[pIdx] * w;
    sumB += sBBuf[pIdx] * w;
    totalWeight += w;
  }

  const denom = totalWeight > 0.0001 ? totalWeight : 1;
  const avgR = Math.round(sumR / denom);
  const avgG = Math.round(sumG / denom);
  const avgB = Math.round(sumB / denom);

  const finalRgb: RgbColor = {
    r: Math.max(0, Math.min(255, avgR)),
    g: Math.max(0, Math.min(255, avgG)),
    b: Math.max(0, Math.min(255, avgB)),
  };

  const finalLab = rgbToLab(finalRgb);
  const hex = rgbToHex(finalRgb);
  const name = approximateColorName(finalRgb);

  return {
    rgb: finalRgb,
    lab: finalLab,
    hex,
    name,
    confidence: Math.min(1, count / (width * height)),
  };
}

/**
 * Maps specificity slider (1 to 100) to Delta E tolerance.
 * Specificity = 1 (Very loose/low specificity) -> Delta E threshold ~ 42
 * Specificity = 50 (Balanced) -> Delta E threshold ~ 18
 * Specificity = 100 (Very strict/high specificity) -> Delta E threshold ~ 5.5
 */
export function specificityToDeltaEThreshold(specificity: number): number {
  // Clamp specificity between 1 and 100
  const s = Math.max(1, Math.min(100, specificity));
  const t = (s - 1) / 99; // 0 to 1
  // Non-linear perceptual scaling
  return 42 - 36.5 * Math.pow(t, 0.75);
}

/**
 * Friendly descriptive color name for UI HUD display
 */
export function approximateColorName(rgb: RgbColor): string {
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  if (lum < 25) return 'Dark Obsidian';
  if (lum > 235 && delta < 15) return 'Pure White';
  if (delta < 18) {
    if (lum < 90) return 'Charcoal Slate';
    if (lum < 160) return 'Neutral Gray';
    return 'Soft Silver';
  }

  // Calculate hue angle
  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }

  if (hue >= 350 || hue < 12) {
    return lum < 100 ? 'Deep Crimson' : lum > 180 ? 'Coral Pink' : 'Vivid Red';
  } else if (hue >= 12 && hue < 45) {
    return lum < 110 ? 'Terracotta' : lum > 180 ? 'Peach Glow' : 'Warm Orange';
  } else if (hue >= 45 && hue < 70) {
    return lum < 120 ? 'Amber Ochre' : lum > 190 ? 'Lemon Pastel' : 'Golden Yellow';
  } else if (hue >= 70 && hue < 160) {
    return lum < 90 ? 'Deep Forest' : lum > 180 ? 'Mint Lime' : 'Emerald Green';
  } else if (hue >= 160 && hue < 200) {
    return lum < 100 ? 'Deep Teal' : lum > 180 ? 'Aqua Ice' : 'Turquoise Cyan';
  } else if (hue >= 200 && hue < 260) {
    return lum < 85 ? 'Midnight Navy' : lum > 180 ? 'Sky Cerulean' : 'Cobalt Blue';
  } else if (hue >= 260 && hue < 315) {
    return lum < 90 ? 'Deep Indigo' : lum > 180 ? 'Soft Lilac' : 'Vibrant Violet';
  } else {
    return lum < 100 ? 'Plum Berry' : lum > 180 ? 'Fuchsia Rose' : 'Magenta';
  }
}
