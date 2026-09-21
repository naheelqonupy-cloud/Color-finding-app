import React, { useEffect, useRef } from 'react';
import { TouchLoupeState } from '../types';

interface MagnifierLoupeProps {
  touchState: TouchLoupeState;
  containerWidth: number;
  containerHeight: number;
  sampleRegionSize?: number;
}

export const MagnifierLoupe: React.FC<MagnifierLoupeProps> = ({
  touchState,
  containerWidth,
  containerHeight,
  sampleRegionSize = 21,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { active, screenX, screenY, sampleBuffer, currentColor } = touchState;

  // Draw the enlarged pixel grid into the loupe canvas using a reusable offscreen canvas
  useEffect(() => {
    if (!active || !sampleBuffer || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    // Clear canvas
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reuse persistent offscreen canvas to scale up the raw pixel sample without allocating DOM nodes
    let offscreen = offscreenCanvasRef.current;
    if (!offscreen) {
      offscreen = document.createElement('canvas');
      offscreenCanvasRef.current = offscreen;
    }
    if (offscreen.width !== sampleBuffer.width || offscreen.height !== sampleBuffer.height) {
      offscreen.width = sampleBuffer.width;
      offscreen.height = sampleBuffer.height;
    }

    const offCtx = offscreen.getContext('2d');
    if (offCtx) {
      offCtx.putImageData(sampleBuffer, 0, 0);
      // Draw zoomed onto target canvas
      ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
    }
  }, [active, sampleBuffer]);

  if (!active || !currentColor) return null;

  // Dynamic positioning:
  // Position the magnifier strictly above the finger with a clear visible gap (~55px clearance from touch point),
  // ensuring the user's finger and the exact touched point are completely unobstructed.
  // If the finger is too close to the top edge (< 240px), automatically flip below the finger with the same clear gap.
  const loupeDiameter = 130;
  const isNearTop = screenY < 240;

  // Calculate vertical center of the circular loupe:
  // When above: bottom of circular lens sits 55px above screenY (center is screenY - 55 - 65 = screenY - 120)
  // When below: top of circular lens sits 55px below screenY (center is screenY + 55 + 65 = screenY + 120)
  const baseCenterY = isNearTop ? screenY + 120 : screenY - 120;

  // Clamp X and Y to stay fully inside screen container
  const halfWidth = loupeDiameter / 2 + 16;
  const clampedX = Math.max(halfWidth, Math.min(containerWidth - halfWidth, screenX));
  const clampedLensCenterY = Math.max(
    halfWidth + 48,
    Math.min(containerHeight - halfWidth - 48, baseCenterY)
  );

  return (
    <>
      {/* Loupe Overlay Assembly - positioned with clear gap above/below finger */}
      <div
        id="magnifier-loupe-container"
        className="pointer-events-none absolute z-40 transition-transform duration-75 ease-out"
        style={{
          left: `${clampedX}px`,
          top: `${clampedLensCenterY}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          id="magnifier-lens"
          className={`relative flex flex-col items-center ${
            isNearTop ? 'flex-col' : 'flex-col-reverse'
          }`}
        >
          {/* Circular Loupe Lens */}
          <div
            className="relative overflow-hidden rounded-full border-2 border-white/90 shadow-2xl ring-4 ring-black/40"
            style={{
              width: `${loupeDiameter}px`,
              height: `${loupeDiameter}px`,
              backgroundColor: '#18181b',
            }}
          >
            {/* Zoomed pixel canvas */}
            <canvas
              ref={canvasRef}
              width={loupeDiameter}
              height={loupeDiameter}
              className="h-full w-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* Central reticle and sampling bounds */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {/* Sampling square outline */}
              <div
                className="rounded-sm border border-dashed border-white/80 shadow-sm"
                style={{
                  width: '42px',
                  height: '42px',
                }}
              />
              {/* Center crosshair dot */}
              <div className="absolute h-2 w-2 rounded-full border border-black/80 bg-white ring-1 ring-white/50" />
              <div className="absolute h-5 w-0.5 bg-white/70" />
              <div className="absolute h-0.5 w-5 bg-white/70" />
            </div>

            {/* Glare sheen */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-transparent to-black/30" />

            {/* Pointer stem towards user's finger */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 z-10 ${
                isNearTop ? '-top-2.5' : '-bottom-2.5'
              }`}
            >
              <div
                className={`h-0 w-0 border-x-8 border-x-transparent drop-shadow-md ${
                  isNearTop
                    ? 'border-b-8 border-b-white/90'
                    : 'border-t-8 border-t-white/90'
                }`}
              />
            </div>
          </div>

          {/* Color Details Badge (Placed on the outer side away from the finger so the gap remains completely open) */}
          <div
            id="magnifier-color-badge"
            className={`flex items-center gap-2 rounded-full border border-white/20 bg-neutral-900/90 px-3 py-1.5 shadow-xl backdrop-blur-md ${
              isNearTop ? 'mt-3' : 'mb-3'
            }`}
          >
            {/* Swatch */}
            <div
              className="h-4 w-4 rounded-full border border-white/60 shadow-inner shrink-0"
              style={{ backgroundColor: currentColor.hex }}
            />

            {/* Color Name & Hex */}
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-semibold text-white leading-tight">
                {currentColor.name || 'Sampled Color'}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-300 font-mono">
                <span>{currentColor.hex}</span>
                <span className="text-neutral-500">•</span>
                <span>L:{Math.round(currentColor.lab.l)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target touch reticle at the exact touch point (stays completely visible with clear gap) */}
      <div
        id="magnifier-touch-point"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-40"
        style={{
          left: `${screenX}px`,
          top: `${screenY}px`,
        }}
      >
        <div className="h-6 w-6 rounded-full border-2 border-white/80 shadow-md ring-1 ring-black/50" />
        <div className="absolute h-1.5 w-1.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-1 ring-black shadow-sm" />
      </div>
    </>
  );
};
