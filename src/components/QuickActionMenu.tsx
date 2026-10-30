import React from 'react';
import {
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Paintbrush,
  Sparkles,
  X,
  Palette
} from 'lucide-react';
import { CanvasSettings } from '../types/canvas';
import { sound } from '../utils/audio';

interface QuickActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CanvasSettings;
  onUpdateSettings: (updater: (prev: CanvasSettings) => CanvasSettings) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

export const QuickActionMenu: React.FC<QuickActionMenuProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onUndo,
  onRedo,
  onClear,
}) => {
  if (!isOpen) return null;

  const quickColors = ['#00f0ff', '#ff007f', '#ffe600', '#00ff66', '#b026ff', '#ffffff'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative glass-panel border border-cyan-500/40 p-6 rounded-3xl max-w-sm w-full mx-4 shadow-2xl shadow-cyan-500/20 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass-button text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
          <span>✋ Open Palm Triggered</span>
        </div>
        <h2 className="text-xl font-bold font-heading text-white mb-1">Quick Action Studio</h2>
        <p className="text-xs text-slate-400 mb-6">Select any command or close your hand to resume</p>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Eraser */}
          <button
            onClick={() => {
              onUpdateSettings(s => ({ ...s, isEraser: !s.isEraser }));
              sound.playToolSwitch();
              onClose();
            }}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all ${
              settings.isEraser
                ? 'bg-rose-500 text-white font-bold'
                : 'glass-panel text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Eraser className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-medium">{settings.isEraser ? 'Brush Mode' : 'Eraser'}</span>
          </button>

          {/* Random Neon Color */}
          <button
            onClick={() => {
              const randColor = quickColors[Math.floor(Math.random() * quickColors.length)];
              onUpdateSettings(s => ({ ...s, color: randColor, isEraser: false }));
              sound.playColorSelect();
              onClose();
            }}
            className="p-3.5 rounded-2xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-all"
          >
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-medium">Random Neon</span>
          </button>

          {/* Undo */}
          <button
            onClick={() => {
              onUndo();
              onClose();
            }}
            className="p-3.5 rounded-2xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-all"
          >
            <Undo2 className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-medium">Undo Stroke</span>
          </button>

          {/* Redo */}
          <button
            onClick={() => {
              onRedo();
              onClose();
            }}
            className="p-3.5 rounded-2xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-all"
          >
            <Redo2 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium">Redo Stroke</span>
          </button>
        </div>

        {/* Quick Color Strip */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {quickColors.map(c => (
            <button
              key={c}
              onClick={() => {
                onUpdateSettings(s => ({ ...s, color: c, isEraser: false }));
                sound.playColorSelect();
                onClose();
              }}
              className="w-8 h-8 rounded-full border border-white/30 hover:scale-110 active:scale-95 transition-all"
              style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}66` }}
            />
          ))}
        </div>

        {/* Clear Canvas */}
        <button
          onClick={() => {
            onClear();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Canvas</span>
        </button>
      </div>
    </div>
  );
};
