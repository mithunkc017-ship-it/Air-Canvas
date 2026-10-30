import React, { useState } from 'react';
import { X, Type, Check } from 'lucide-react';
import { TextElement } from '../types/canvas';

interface TextToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onAddText: (textEl: TextElement) => void;
}

export const TextToolModal: React.FC<TextToolModalProps> = ({
  isOpen,
  onClose,
  currentColor,
  onAddText,
}) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState("'Outfit', sans-serif");
  const [color, setColor] = useState(currentColor);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAddText({
      id: `text_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: text.trim(),
      x: 100,
      y: 150,
      color,
      fontSize,
      fontFamily,
    });

    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative glass-panel border border-white/20 p-6 rounded-3xl max-w-md w-full shadow-2xl shadow-cyan-500/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass-button text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold font-heading text-lg text-white">Add Typed Text to Canvas</h3>
            <p className="text-xs text-slate-400">Position typed words anywhere on your artwork</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Text Content</label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. AirCanvas Magic ✨"
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Font Size ({fontSize}px)</label>
              <input
                type="range"
                min="16"
                max="96"
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Font Family</label>
              <select
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="'Outfit', sans-serif">Modern Bold (Outfit)</option>
                <option value="'Plus Jakarta Sans', sans-serif">Clean Sans</option>
                <option value="ui-monospace, monospace">Retro Monospace</option>
                <option value="'Brush Script MT', cursive">Artistic Cursive</option>
              </select>
            </div>
          </div>

          {/* Text Preview Box */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 min-h-16 flex items-center justify-center overflow-hidden">
            <span
              style={{
                fontFamily,
                fontSize: `${Math.min(fontSize, 40)}px`,
                color,
              }}
              className="font-bold"
            >
              {text || 'Sample Text Preview'}
            </span>
          </div>

          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span>Place on Canvas</span>
          </button>
        </form>
      </div>
    </div>
  );
};
