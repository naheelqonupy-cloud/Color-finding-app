import React from 'react';
import { SelectedColorData } from '../types';
import { Lock, Unlock, SwitchCamera, Sparkles, Smartphone, Plus, Package } from 'lucide-react';

interface TopBarOverlayProps {
  selectedColor: SelectedColorData | null;
  isColorLocked: boolean;
  onToggleLock: () => void;
  onSwitchCamera: () => void;
  isSimulatedScene: boolean;
  onToggleSimulatedScene: () => void;
  onOpenAndroidModal: () => void;
  onOpenManualColorModal: () => void;
  hasMultipleCameras: boolean;
}

export const TopBarOverlay: React.FC<TopBarOverlayProps> = ({
  selectedColor,
  isColorLocked,
  onToggleLock,
  onSwitchCamera,
  isSimulatedScene,
  onToggleSimulatedScene,
  onOpenAndroidModal,
  onOpenManualColorModal,
  hasMultipleCameras,
}) => {
  return (
    <header
      id="top-hud-overlay"
      className="pointer-events-none absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3.5 sm:p-5"
    >
      {/* Left: Selected Color Indicator Badge + Manual Color Button */}
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="flex items-center gap-2.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 backdrop-blur-md shadow-lg">
          {selectedColor ? (
            <>
              <div
                className="h-5 w-5 rounded-full border-2 border-white shadow-inner shrink-0"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <div className="flex flex-col text-left pr-1">
                <span className="text-xs font-semibold text-white leading-tight">
                  {selectedColor.name || 'Selected'}
                </span>
                <span className="text-[10px] font-mono text-neutral-300">
                  {selectedColor.hex}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 py-0.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Touch to pick color</span>
            </div>
          )}
        </div>

        {/* Small unobtrusive + Color manual entry button */}
        <button
          id="manual-color-picker-btn"
          type="button"
          onClick={onOpenManualColorModal}
          title="Enter target HEX / RGB color code manually"
          className="flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-2.5 py-1.5 text-xs font-medium text-neutral-200 backdrop-blur-md shadow-lg hover:bg-black/70 hover:text-white active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[11px]">+ Color</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Color Lock / Unlock Button */}
        <button
          id="color-lock-toggle-btn"
          onClick={onToggleLock}
          disabled={!selectedColor}
          title={isColorLocked ? 'Color is Locked (Click to Unlock)' : 'Click to Lock Target Color'}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-md shadow-lg transition-all ${
            isColorLocked
              ? 'border-amber-400/80 bg-amber-500/30 text-amber-200 ring-2 ring-amber-400/30'
              : 'border-white/20 bg-black/50 text-white hover:bg-black/70'
          } ${!selectedColor ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
        >
          {isColorLocked ? (
            <>
              <Lock className="h-3.5 w-3.5 text-amber-300" />
              <span>Locked</span>
            </>
          ) : (
            <>
              <Unlock className="h-3.5 w-3.5 text-neutral-300" />
              <span>Lock</span>
            </>
          )}
        </button>

        {/* Camera switcher (Rear/Front) */}
        {hasMultipleCameras && !isSimulatedScene && (
          <button
            id="switch-camera-btn"
            onClick={onSwitchCamera}
            title="Switch Camera (Front / Back)"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md shadow-lg hover:bg-black/70 active:scale-95 transition-all"
          >
            <SwitchCamera className="h-4 w-4" />
          </button>
        )}

        {/* Test Scene / Live Camera toggle */}
        <button
          id="toggle-test-scene-btn"
          onClick={onToggleSimulatedScene}
          title={isSimulatedScene ? 'Switch to Real Camera' : 'Switch to Test Scene (Vibrant Fruit)'}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md shadow-lg transition-all ${
            isSimulatedScene
              ? 'border-emerald-500/70 bg-emerald-500/25 text-emerald-200'
              : 'border-white/20 bg-black/50 text-neutral-200 hover:bg-black/70'
          } active:scale-95`}
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{isSimulatedScene ? 'Test Feed' : 'Test Scene'}</span>
        </button>

        {/* Android Studio Native Project Code View & APK Export */}
        <button
          id="open-android-project-btn"
          onClick={onOpenAndroidModal}
          title="Export Android Studio Project & Download APK"
          className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-lg hover:bg-emerald-500/30 active:scale-95 transition-all cursor-pointer"
        >
          <Package className="h-3.5 w-3.5 text-emerald-400" />
          <span>Export / APK</span>
        </button>
      </div>
    </header>
  );
};
