import React from 'react';
import { CameraMode, FilterSettings } from '../types';
import { Sliders, Camera, Eye, Disc, RotateCcw } from 'lucide-react';

interface BottomControlsOverlayProps {
  mode: CameraMode;
  onToggleMode: () => void;
  settings: FilterSettings;
  onUpdateSettings: (newSettings: Partial<FilterSettings>) => void;
  onCapturePhoto: () => void;
  hasTargetColor: boolean;
  isCapturing: boolean;
  lastPhotoThumb?: string | null;
  onViewLastPhoto?: () => void;
}

export const BottomControlsOverlay: React.FC<BottomControlsOverlayProps> = ({
  mode,
  onToggleMode,
  settings,
  onUpdateSettings,
  onCapturePhoto,
  hasTargetColor,
  isCapturing,
  lastPhotoThumb,
  onViewLastPhoto,
}) => {
  return (
    <footer
      id="bottom-hud-overlay"
      className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center justify-end p-3 sm:p-5"
    >
      {/* Translucent HUD card */}
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/20 bg-black/55 p-3.5 sm:p-4 backdrop-blur-xl shadow-2xl space-y-3">
        {/* Sliders Row: Color Specificity & Saturation */}
        <div className="space-y-2.5">
          {/* Color Specificity Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-neutral-200">
              <span className="flex items-center gap-1.5">
                <Sliders className="h-3 w-3 text-emerald-400" />
                Color Specificity
              </span>
              <span className="text-[10px] text-neutral-400">
                {settings.specificity <= 30
                  ? 'Loose / Wide'
                  : settings.specificity >= 75
                  ? 'Strict / Exact'
                  : 'Balanced'}
                <span className="ml-1.5 font-mono text-emerald-400">{settings.specificity}%</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 select-none">Loose</span>
              <input
                id="color-specificity-slider"
                type="range"
                min="1"
                max="100"
                value={settings.specificity}
                onChange={(e) => onUpdateSettings({ specificity: Number(e.target.value) })}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-neutral-700 accent-emerald-500 hover:accent-emerald-400"
              />
              <span className="text-[10px] text-neutral-400 select-none">Strict</span>
            </div>
          </div>

          {/* Saturation Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-neutral-200">
              <span className="flex items-center gap-1.5">
                <Disc className="h-3 w-3 text-cyan-400" />
                Saturation
              </span>
              <span className="font-mono text-[10px] text-cyan-400">
                {settings.saturation.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 select-none">0x</span>
              <input
                id="camera-saturation-slider"
                type="range"
                min="0.0"
                max="2.0"
                step="0.05"
                value={settings.saturation}
                onChange={(e) => onUpdateSettings({ saturation: Number(e.target.value) })}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-neutral-700 accent-cyan-400 hover:accent-cyan-300"
              />
              <span className="text-[10px] text-neutral-400 select-none">2x</span>
              {/* Compact Reset button */}
              <button
                id="reset-saturation-btn"
                type="button"
                onClick={() => onUpdateSettings({ saturation: 1.0 })}
                title="Reset saturation to normal camera default (1.0x)"
                className={`flex h-6 w-6 items-center justify-center rounded-md border text-neutral-300 transition-all hover:bg-white/20 hover:text-white active:scale-90 shrink-0 ${
                  Math.abs(settings.saturation - 1.0) > 0.02
                    ? 'border-cyan-400/50 bg-cyan-950/50 text-cyan-300 shadow-sm shadow-cyan-950/40'
                    : 'border-white/10 bg-white/5 text-neutral-400'
                }`}
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls: Mode Switcher + Big Shutter Button + Last Photo */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          {/* Mode Switcher Button (Normal vs Find Color) */}
          <button
            id="camera-mode-toggle-btn"
            onClick={onToggleMode}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 ${
              mode === 'FIND_COLOR'
                ? 'border-emerald-500/80 bg-emerald-500/30 text-emerald-200 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-500/40'
                : 'border-white/20 bg-neutral-800/80 text-white hover:bg-neutral-700/90'
            }`}
          >
            <Eye className={`h-4 w-4 ${mode === 'FIND_COLOR' ? 'text-emerald-400 animate-pulse' : 'text-neutral-300'}`} />
            <div className="flex flex-col text-left">
              <span>{mode === 'FIND_COLOR' ? 'FIND COLOR' : 'NORMAL'}</span>
              <span className="text-[9px] font-normal text-neutral-300">
                {mode === 'FIND_COLOR' ? 'Isolating Match' : 'Tap to Find'}
              </span>
            </div>
          </button>

          {/* Center: Camera Shutter Button */}
          <div className="flex items-center justify-center">
            <button
              id="camera-shutter-btn"
              onClick={onCapturePhoto}
              disabled={isCapturing}
              title="Capture Photo to MediaStore"
              className="group relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-white/90 bg-white/20 p-1 shadow-2xl transition-transform active:scale-90"
            >
              <div
                className={`h-full w-full rounded-full transition-all ${
                  isCapturing ? 'scale-75 bg-red-500' : 'bg-white group-hover:scale-95'
                }`}
              />
            </button>
          </div>

          {/* Right: Last Photo Thumbnail preview or Gallery shortcut */}
          <div className="flex items-center justify-end w-20">
            {lastPhotoThumb ? (
              <button
                id="view-last-photo-btn"
                onClick={onViewLastPhoto}
                title="View Last Captured Photo"
                className="relative h-10 w-10 overflow-hidden rounded-lg border-2 border-white/80 shadow-md active:scale-95 transition-transform"
              >
                <img
                  src={lastPhotoThumb}
                  alt="Last capture"
                  className="h-full w-full object-cover"
                />
              </button>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-neutral-500">
                <Camera className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
