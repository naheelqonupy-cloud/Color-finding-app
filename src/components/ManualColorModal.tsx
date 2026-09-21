import React, { useState, useEffect } from 'react';
import { X, Check, Hash } from 'lucide-react';
import { SelectedColorData } from '../types';
import {
  createSelectedColorFromHex,
  createSelectedColorFromRgb,
  hexToRgb,
  rgbToHex,
} from '../utils/colorConversion';

interface ManualColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyColor: (color: SelectedColorData) => void;
  currentColorHex?: string;
}

export const ManualColorModal: React.FC<ManualColorModalProps> = ({
  isOpen,
  onClose,
  onApplyColor,
  currentColorHex = '#7A5238',
}) => {
  const [hexInput, setHexInput] = useState<string>(currentColorHex);
  const [rVal, setRVal] = useState<number>(122);
  const [gVal, setGVal] = useState<number>(82);
  const [bVal, setBVal] = useState<number>(56);
  const [parsedColor, setParsedColor] = useState<SelectedColorData | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialHex = currentColorHex.startsWith('#') ? currentColorHex : `#${currentColorHex}`;
      setHexInput(initialHex);
      const parsed = createSelectedColorFromHex(initialHex);
      if (parsed) {
        setParsedColor(parsed);
        setRVal(parsed.rgb.r);
        setGVal(parsed.rgb.g);
        setBVal(parsed.rgb.b);
      }
    }
  }, [isOpen, currentColorHex]);

  if (!isOpen) return null;

  // Handle HEX input change
  const handleHexChange = (value: string) => {
    setHexInput(value);
    const cleaned = value.trim();
    const candidate = cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
    const parsed = createSelectedColorFromHex(candidate);
    if (parsed) {
      setParsedColor(parsed);
      setRVal(parsed.rgb.r);
      setGVal(parsed.rgb.g);
      setBVal(parsed.rgb.b);
    }
  };

  // Handle RGB numeric inputs change
  const handleRgbChange = (newR: number, newG: number, newB: number) => {
    const clampedR = Math.max(0, Math.min(255, isNaN(newR) ? 0 : newR));
    const clampedG = Math.max(0, Math.min(255, isNaN(newG) ? 0 : newG));
    const clampedB = Math.max(0, Math.min(255, isNaN(newB) ? 0 : newB));
    setRVal(clampedR);
    setGVal(clampedG);
    setBVal(clampedB);

    const parsed = createSelectedColorFromRgb({ r: clampedR, g: clampedG, b: clampedB });
    setParsedColor(parsed);
    setHexInput(parsed.hex);
  };

  const handleApply = () => {
    if (parsedColor) {
      onApplyColor(parsedColor);
      onClose();
    }
  };

  return (
    <div
      id="manual-color-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="manual-color-modal-card"
        className="w-full max-w-sm rounded-2xl border border-white/20 bg-neutral-900/95 p-5 shadow-2xl backdrop-blur-xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Enter Target Color</h2>
          </div>
          <button
            id="close-manual-color-modal-btn"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Color Preview & Information */}
        <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-black/40 p-3">
          <div
            id="manual-color-swatch-preview"
            className="h-12 w-12 rounded-xl border-2 border-white/80 shadow-md shrink-0 transition-colors"
            style={{ backgroundColor: parsedColor ? parsedColor.hex : '#333333' }}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate">
              {parsedColor?.name || 'Invalid Color'}
            </span>
            <span className="font-mono text-xs text-neutral-300">
              {parsedColor?.hex || '---'}
            </span>
            {parsedColor && (
              <span className="text-[10px] text-neutral-400 font-mono">
                L:{Math.round(parsedColor.lab.l)} a:{Math.round(parsedColor.lab.a)} b:{Math.round(parsedColor.lab.b)}
              </span>
            )}
          </div>
        </div>

        {/* HEX Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">
            HEX Color Code
          </label>
          <div className="relative flex items-center">
            <input
              id="manual-hex-input"
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#7A5238"
              maxLength={7}
              autoFocus
              className="w-full rounded-xl border border-white/20 bg-neutral-800/80 px-3.5 py-2 font-mono text-sm uppercase text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <p className="text-[10px] text-neutral-400">
            Primary format: #RRGGBB (e.g., #7A5238 or #336699)
          </p>
        </div>

        {/* RGB Component Inputs */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">
            RGB Values (0 - 255)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-red-400 font-semibold block mb-0.5">R</span>
              <input
                id="manual-rgb-r-input"
                type="number"
                min="0"
                max="255"
                value={rVal}
                onChange={(e) => handleRgbChange(parseInt(e.target.value, 10), gVal, bVal)}
                className="w-full rounded-lg border border-white/15 bg-neutral-800/80 px-2 py-1.5 text-center font-mono text-xs text-white focus:border-red-400 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-green-400 font-semibold block mb-0.5">G</span>
              <input
                id="manual-rgb-g-input"
                type="number"
                min="0"
                max="255"
                value={gVal}
                onChange={(e) => handleRgbChange(rVal, parseInt(e.target.value, 10), bVal)}
                className="w-full rounded-lg border border-white/15 bg-neutral-800/80 px-2 py-1.5 text-center font-mono text-xs text-white focus:border-green-400 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-blue-400 font-semibold block mb-0.5">B</span>
              <input
                id="manual-rgb-b-input"
                type="number"
                min="0"
                max="255"
                value={bVal}
                onChange={(e) => handleRgbChange(rVal, gVal, parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-white/15 bg-neutral-800/80 px-2 py-1.5 text-center font-mono text-xs text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] text-neutral-400">Presets:</span>
          {['#7A5238', '#336699', '#DC2626', '#10B981', '#EAB308'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleHexChange(preset)}
              className="h-5 w-5 rounded-md border border-white/40 shadow-sm transition-transform hover:scale-110 active:scale-95"
              style={{ backgroundColor: preset }}
              title={preset}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            id="cancel-manual-color-btn"
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-neutral-800/80 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            id="apply-manual-color-btn"
            type="button"
            disabled={!parsedColor}
            onClick={handleApply}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-3.5 w-3.5" />
            Apply Color
          </button>
        </div>
      </div>
    </div>
  );
};
