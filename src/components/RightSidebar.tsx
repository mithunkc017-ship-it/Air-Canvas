import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Sliders,
  Sparkles,
  Check,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { CanvasSettings } from '../types/canvas';
import { HandTrackingState } from '../types/gestures';
import { sound } from '../utils/audio';

interface RightSidebarProps {
  settings: CanvasSettings;
  trackingState: HandTrackingState;
  onUpdateSettings: (updater: (prev: CanvasSettings) => CanvasSettings) => void;
  hoveredColorProgress: { color: string; progress: number } | null;
  onRegisterColorSwatch: (color: string, el: HTMLElement | null) => void;
}

// 28 handcrafted vibrant colors across Neon, Pastel, Cyberpunk, and Classic
export const COLOR_PALETTES = [
  // Neon Cyberpunk
  { name: 'Electric Cyan', hex: '#00f0ff', category: 'neon' },
  { name: 'Neon Pink', hex: '#ff007f', category: 'neon' },
  { name: 'Laser Lime', hex: '#00ff66', category: 'neon' },
  { name: 'Solar Yellow', hex: '#ffe600', category: 'neon' },
  { name: 'Ultra Violet', hex: '#b026ff', category: 'neon' },
  { name: 'Plasma Orange', hex: '#ff5500', category: 'neon' },
  { name: 'Electric Blue', hex: '#0088ff', category: 'neon' },

  // Vibrant & Bold
  { name: 'Crimson Red', hex: '#ef4444', category: 'bold' },
  { name: 'Emerald Green', hex: '#10b981', category: 'bold' },
  { name: 'Vivid Amber', hex: '#f59e0b', category: 'bold' },
  { name: 'Royal Purple', hex: '#8b5cf6', category: 'bold' },
  { name: 'Hot Magenta', hex: '#ec4899', category: 'bold' },
  { name: 'Teal Lagoon', hex: '#14b8a6', category: 'bold' },
  { name: 'Sky Azure', hex: '#0ea5e9', category: 'bold' },

  // Soft Pastels
  { name: 'Pastel Rose', hex: '#fca5a5', category: 'pastel' },
  { name: 'Peach Cream', hex: '#fdba74', category: 'pastel' },
  { name: 'Soft Butter', hex: '#fde047', category: 'pastel' },
  { name: 'Mint Dream', hex: '#86efac', category: 'pastel' },
  { name: 'Ice Lavender', hex: '#d8b4fe', category: 'pastel' },
  { name: 'Baby Sky', hex: '#7dd3fc', category: 'pastel' },
  { name: 'Blush Pink', hex: '#f9a8d4', category: 'pastel' },

  // Essentials & Monochrome
  { name: 'Pure White', hex: '#ffffff', category: 'essential' },
  { name: 'Silver Frost', hex: '#cbd5e1', category: 'essential' },
  { name: 'Slate Gray', hex: '#64748b', category: 'essential' },
  { name: 'Midnight Charcoal', hex: '#1e293b', category: 'essential' },
  { name: 'Obsidian Black', hex: '#000000', category: 'essential' },
  { name: 'Liquid Gold', hex: '#ffd700', category: 'essential' },
  { name: 'Rose Gold', hex: '#e0a96d', category: 'essential' },
];

export const RightSidebar: React.FC<RightSidebarProps> = ({
  settings,
  trackingState: _trackingState,
  onUpdateSettings,
  hoveredColorProgress,
  onRegisterColorSwatch,
}) => {
  const [activeTab, setActiveTab] = useState<'palette' | 'adjust'>('palette');
  const [activeCategory, setActiveCategory] = useState<'all' | 'neon' | 'bold' | 'pastel' | 'essential'>('all');
  const [isGestureTipOpen, setIsGestureTipOpen] = useState(true);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const filteredColors = activeCategory === 'all'
    ? COLOR_PALETTES
    : COLOR_PALETTES.filter(c => c.category === activeCategory);

  const handleSelectColor = (hex: string) => {
    sound.playColorSelect();
    onUpdateSettings(s => ({ ...s, color: hex, isEraser: false }));
  };

  return (
    <aside className="w-72 md:w-80 glass-panel border-l border-white/10 flex flex-col z-20 select-none overflow-hidden shrink-0">
      {/* Header Tabs */}
      <div className="h-12 border-b border-white/10 flex items-center px-2 bg-black/20">
        <button
          onClick={() => setActiveTab('palette')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'palette'
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Virtual Palette</span>
        </button>

        <button
          onClick={() => setActiveTab('adjust')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'adjust'
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Stroke & Size</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'palette' ? (
          <>
            {/* Live Color Preview Bar */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl shadow-lg border-2 border-white/30 flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: settings.color,
                    boxShadow: `0 0 20px ${settings.color}55`,
                  }}
                >
                  <Sparkles className="w-5 h-5 text-white/90 drop-shadow" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Color</div>
                  <div className="text-sm font-mono font-bold text-white uppercase">{settings.color}</div>
                </div>
              </div>

              {/* Custom Hex Picker Button */}
              <div>
                <input
                  type="color"
                  ref={colorInputRef}
                  value={settings.color}
                  onChange={e => handleSelectColor(e.target.value)}
                  className="sr-only"
                />
                <button
                  onClick={() => colorInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg glass-button text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1.5"
                  title="Pick any custom hex color"
                >
                  <span>Custom</span>
                  <div className="w-3.5 h-3.5 rounded-full border border-white/40" style={{ backgroundColor: settings.color }} />
                </button>
              </div>
            </div>

            {/* Gesture Hover Instructions Banner */}
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 flex items-start gap-2">
              <span className="text-base leading-none">✨</span>
              <p className="leading-tight">
                <strong>Air Touch:</strong> Hover your index finger over any color swatch for 0.7s to automatically select it!
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['all', 'neon', 'bold', 'pastel', 'essential'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                      : 'glass-button text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Color Swatches Grid (28 Colors) */}
            <div className="grid grid-cols-4 gap-2.5">
              {filteredColors.map(c => {
                const isSelected = settings.color.toLowerCase() === c.hex.toLowerCase();
                const isHovered = hoveredColorProgress?.color.toLowerCase() === c.hex.toLowerCase();
                const progress = isHovered ? hoveredColorProgress.progress : 0;

                return (
                  <div
                    key={c.hex}
                    ref={el => onRegisterColorSwatch(c.hex, el)}
                    onClick={() => handleSelectColor(c.hex)}
                    className="relative group flex flex-col items-center cursor-pointer"
                  >
                    <div
                      className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all transform ${
                        isSelected
                          ? 'scale-110 ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#090b10] shadow-lg'
                          : 'hover:scale-105 active:scale-95'
                      }`}
                      style={{
                        backgroundColor: c.hex,
                        boxShadow: isSelected ? `0 0 16px ${c.hex}88` : undefined,
                      }}
                    >
                      {/* Selection Checkmark */}
                      {isSelected && (
                        <Check
                          className={`w-5 h-5 ${
                            c.hex === '#ffffff' || c.hex === '#ffe600' || c.hex === '#86efac'
                              ? 'text-black'
                              : 'text-white'
                          } drop-shadow`}
                        />
                      )}

                      {/* Finger Dwell Radial Progress Ring */}
                      {progress > 0 && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
                          <circle
                            cx="24"
                            cy="24"
                            r="21"
                            fill="none"
                            stroke="#00f0ff"
                            strokeWidth="4"
                            strokeDasharray={2 * Math.PI * 21}
                            strokeDashoffset={2 * Math.PI * 21 * (1 - progress)}
                            className="transition-all duration-75"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 truncate max-w-[48px] mt-1 text-center font-medium">
                      {c.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Adjust Stroke & Size Settings */
          <div className="space-y-6">
            {/* Brush Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Brush Thickness</span>
                <span className="font-mono text-cyan-400 font-bold">{settings.size}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="80"
                value={settings.size}
                onChange={e => onUpdateSettings(s => ({ ...s, size: Number(e.target.value) }))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex items-center justify-center p-4 rounded-xl bg-black/30 border border-white/5">
                <div
                  className="rounded-full transition-all"
                  style={{
                    width: `${Math.min(settings.size, 60)}px`,
                    height: `${Math.min(settings.size, 60)}px`,
                    backgroundColor: settings.color,
                    boxShadow: `0 0 12px ${settings.color}66`,
                  }}
                />
              </div>
            </div>

            {/* Brush Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Brush Opacity</span>
                <span className="font-mono text-purple-400 font-bold">{Math.round(settings.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.opacity}
                onChange={e => onUpdateSettings(s => ({ ...s, opacity: Number(e.target.value) }))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Stroke Smoothing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Smoothing Factor</span>
                <span className="font-mono text-pink-400 font-bold">{Math.round(settings.smoothing * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.85"
                step="0.05"
                value={settings.smoothing}
                onChange={e => onUpdateSettings(s => ({ ...s, smoothing: Number(e.target.value) }))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-400"
              />
              <p className="text-[10px] text-slate-400">
                Higher smoothing eliminates hand jitter for buttery-smooth calligraphy.
              </p>
            </div>
          </div>
        )}

        {/* Collapsible Gesture Reference Box */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => setIsGestureTipOpen(!isGestureTipOpen)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 mb-2 hover:text-white"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gesture Cheat-Sheet</span>
            </span>
            {isGestureTipOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {isGestureTipOpen && (
            <div className="space-y-2 text-[11px] bg-black/30 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-cyan-300 font-semibold">☝️ 1 Finger:</span>
                <span className="text-slate-300">Draw stroke</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-300 font-semibold">✌️ 2 Fingers:</span>
                <span className="text-slate-300">Hover / Navigate</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-semibold">✊ Fist:</span>
                <span className="text-slate-300">Pause drawing</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-300 font-semibold">✋ Open Palm:</span>
                <span className="text-slate-300">Action Menu</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-pink-300 font-semibold">🤏 Pinch:</span>
                <span className="text-slate-300">Pick color</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
