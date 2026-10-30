import React, { useState } from 'react';
import {
  X,
  FolderHeart,
  Download,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Artwork } from '../types/canvas';
import { deleteArtwork } from '../utils/storage';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: Artwork[];
  onLoadArtwork: (artwork: Artwork) => void;
  onDeleteArtwork: (updated: Artwork[]) => void;
  onNewArtwork: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  artworks,
  onLoadArtwork,
  onDeleteArtwork,
  onNewArtwork,
}) => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  if (!isOpen) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this artwork?')) {
      const updated = deleteArtwork(id);
      onDeleteArtwork(updated);
      if (selectedArtwork?.id === id) {
        setSelectedArtwork(null);
      }
    }
  };

  const handleDownload = (artwork: Artwork, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = artwork.previewUrl;
    a.download = `${artwork.title.toLowerCase().replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="relative glass-panel border border-white/20 p-6 md:p-8 rounded-3xl max-w-4xl w-full shadow-2xl shadow-cyan-500/10 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-heading text-white">Your Art Gallery</h2>
              <p className="text-xs text-slate-400">Saved sketches created in AirCanvas AI</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewArtwork();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-500/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Canvas</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full glass-button text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Artwork Grid or Empty State */}
        <div className="flex-1 overflow-y-auto py-6">
          {artworks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-500">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-300 mb-1">No Saved Artworks Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Paint your first masterpiece in the air and click "Export → Save to Gallery" from the top bar!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {artworks.map(art => (
                <div
                  key={art.id}
                  onClick={() => {
                    onLoadArtwork(art);
                    onClose();
                  }}
                  className="group relative rounded-2xl glass-panel-subtle border border-white/10 overflow-hidden hover:border-cyan-500/40 transition-all cursor-pointer hover:-translate-y-1 shadow-lg"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video w-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
                    {art.previewUrl ? (
                      <img
                        src={art.previewUrl}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-slate-600 text-xs">No preview</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <span className="text-[11px] font-bold text-white flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Open in Studio</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={e => handleDownload(art, e)}
                          title="Download PNG"
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => handleDelete(art.id, e)}
                          title="Delete Artwork"
                          className="p-1.5 rounded-lg bg-rose-500/40 hover:bg-rose-500 text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info bar */}
                  <div className="p-3">
                    <h4 className="font-bold text-sm text-white truncate mb-1">{art.title}</h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-500" />
                        <span>{art.strokes.length} strokes</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
