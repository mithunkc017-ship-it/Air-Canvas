import React from 'react';
import {
  Paintbrush,
  Zap,
  Flame,
  Droplets,
  Sparkles,
  Wind,
  Grid,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Type,
  Shapes,
  Rainbow
} from 'lucide-react';
import { BrushType, CanvasSettings } from '../types/canvas';
import { sound } from '../utils/audio';

interface LeftSidebarProps {
  settings: CanvasSettings;
  canUndo: boolean;
  canRedo: boolean;
  onUpdateSettings: (updater: (prev: CanvasSettings) => CanvasSettings) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onOpenTextTool: () => void;
}

interface BrushOption {
  type: BrushType;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  settings,
  canUndo,
  canRedo,
  onUpdateSettings,
  onUndo,
  onRedo,
  onClear,
  onOpenTextTool,
}) => {
  const brushes: BrushOption[] = [
    { type: 'classic', label: 'Classic Paint', icon: <Paintbrush className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500', description: 'Clean smooth opaque acrylic strokes' },
    { type: 'neon', label: 'Neon Glow', icon: <Zap className="w-4 h-4" />, color: 'from-cyan-400 to-blue-500', description: 'Vibrant luminescent laser glow' },
    { type: 'rainbow', label: 'Rainbow Stream', icon: <Rainbow className="w-4 h-4" />, color: 'from-pink-500 via-amber-400 to-cyan-400', description: 'Dynamic shifting prism spectrum' },
    { type: 'fire', label: 'Fire Particles', icon: <Flame className="w-4 h-4" />, color: 'from-amber-500 to-rose-600', description: 'Blazing embers rising in real time' },
    { type: 'sparkle', label: 'Sparkle Dust', icon: <Sparkles className="w-4 h-4" />, color: 'from-yellow-300 to-amber-500', description: 'Magical shimmering stardust trail' },
    { type: 'watercolor', label: 'Watercolor', icon: <Droplets className="w-4 h-4" />, color: 'from-teal-400 to-emerald-500', description: 'Soft bleeding fluid wash' },
    { type: 'airbrush', label: 'Soft Airbrush', icon: <Wind className="w-4 h-4" />, color: 'from-purple-400 to-pink-500', description: 'Feathered misty spray' },
    { type: 'pixel', label: 'Pixel Retro', icon: <Grid className="w-4 h-4" />, color: 'from-emerald-400 to-cyan-500', description: 'Crisp stepped 8-bit digital blocks' },
  ];

  const handleSelectBrush = (b: BrushType) => {
    sound.playToolSwitch();
    onUpdateSettings(s => ({ ...s, brush: b, isEraser: false }));
  };

  const handleToggleEraser = () => {
    sound.playToolSwitch();
    onUpdateSettings(s => ({ ...s, isEraser: !s.isEraser }));
  };

  const handleToggleShapeAssist = () => {
    sound.playToolSwitch();
    onUpdateSettings(s => ({ ...s, shapeAssistance: !s.shapeAssistance }));
  };

  return (
    <aside className="w-16 md:w-20 glass-panel border-r border-white/10 flex flex-col items-center py-4 gap-4 z-20 select-none overflow-y-auto shrink-0">
      {/* Brushes Section */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Brushes</span>
        {brushes.map(b => {
          const isActive = !settings.isEraser && settings.brush === b.type;
          return (
            <button
              key={b.type}
              onClick={() => handleSelectBrush(b.type)}
              title={`${b.label} — ${b.description}`}
              className={`relative w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all group ${
                isActive
                  ? `bg-gradient-to-tr ${b.color} text-white shadow-lg shadow-cyan-500/30 scale-105`
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/10'
              }`}
            >
              {b.icon}
              <span className="text-[8px] font-medium mt-1 tracking-tight text-center truncate max-w-[42px] leading-tight">
                {b.type === 'watercolor' ? 'Water' : b.type === 'classic' ? 'Paint' : b.type}
              </span>
              {isActive && (
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="w-10 h-px bg-white/10 my-1" />

      {/* Eraser & Tools */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Tools</span>

        {/* Eraser */}
        <button
          onClick={handleToggleEraser}
          title="Eraser Tool"
          className={`relative w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
            settings.isEraser
              ? 'bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30 scale-105'
              : 'text-slate-400 hover:text-slate-100 hover:bg-white/10'
          }`}
        >
          <Eraser className="w-4 h-4" />
          <span className="text-[8px] font-medium mt-1">Eraser</span>
          {settings.isEraser && (
            <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-pink-400 shadow-[0_0_8px_#ff007f]" />
          )}
        </button>

        {/* Text Tool */}
        <button
          onClick={onOpenTextTool}
          title="Add Text to Canvas"
          className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-all"
        >
          <Type className="w-4 h-4 text-purple-400" />
          <span className="text-[8px] font-medium mt-1">Text</span>
        </button>

        {/* Shape Assistance */}
        <button
          onClick={handleToggleShapeAssist}
          title={settings.shapeAssistance ? 'Shape Assist: ON (Auto-detects circles, lines, rectangles, triangles)' : 'Shape Assist: OFF'}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
            settings.shapeAssistance
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-100 hover:bg-white/10'
          }`}
        >
          <Shapes className="w-4 h-4" />
          <span className="text-[8px] font-medium mt-1">Shapes</span>
        </button>
      </div>

      <div className="w-10 h-px bg-white/10 my-1" />

      {/* History Controls */}
      <div className="flex flex-col items-center gap-2 w-full px-2 mt-auto">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            canUndo ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            canRedo ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onClear}
          title="Clear Canvas"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all mt-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
