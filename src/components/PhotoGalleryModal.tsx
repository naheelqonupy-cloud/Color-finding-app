import React from 'react';
import { CapturedPhoto } from '../types';
import { X, Download, Trash2, Calendar, CheckCircle2 } from 'lucide-react';

interface PhotoGalleryModalProps {
  photo: CapturedPhoto | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  photo,
  onClose,
  onDelete,
}) => {
  if (!photo) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    const dateStr = new Date(photo.timestamp).toISOString().replace(/[:.]/g, '-');
    a.download = `LiveColorFinder_${dateStr}.jpg`;
    a.click();
  };

  const formattedDate = new Date(photo.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/20 bg-neutral-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 bg-neutral-950/70">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white">Saved to MediaStore / Device</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Photo Image */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
          <img
            src={photo.dataUrl}
            alt="Captured color finder snapshot"
            className="max-h-[60vh] w-full object-contain"
          />

          {/* Mode watermark badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] text-white backdrop-blur-md">
            <span>Mode: {photo.mode}</span>
            {photo.targetColorHex && (
              <>
                <div
                  className="h-3 w-3 rounded-full border border-white/80"
                  style={{ backgroundColor: photo.targetColorHex }}
                />
                <span className="font-mono text-[10px] text-neutral-300">{photo.targetColorHex}</span>
              </>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-neutral-800 px-4 py-3 bg-neutral-950/70">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(photo.id)}
              className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
