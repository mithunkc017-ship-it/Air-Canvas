import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  CameraOff,
  MousePointer,
  Hand,
  Volume2,
  VolumeX,
  Download,
  Share2,
  FolderHeart,
  HelpCircle,
  Wand2,
  ChevronDown
} from 'lucide-react';
import { CanvasSettings, BackgroundType } from '../types/canvas';
import { HandTrackingState } from '../types/gestures';

interface TopBarProps {
  settings: CanvasSettings;
  trackingState: HandTrackingState;
  onUpdateSettings: (updater: (prev: CanvasSettings) => CanvasSettings) => void;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  onShare: () => void;
  onSaveToGallery: () => void;
  onOpenGallery: () => void;
  onOpenGestureGuide: () => void;
  onToggleAIStudio: () => void;
  isAIStudioOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  trackingState,
  onUpdateSettings,
  onStartCamera,
  onStopCamera,
  onExportPNG,
  onExportSVG,
  onShare,
  onSaveToGallery,
  onOpenGallery,
  onOpenGestureGuide,
  onToggleAIStudio,
  isAIStudioOpen,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBgMenu, setShowBgMenu] = useState(false);

  const backgrounds: { id: BackgroundType; label: string; icon: string }[] = [
    { id: 'dark', label: 'Dark Charcoal', icon: '⬛' },
    { id: 'white', label: 'Clean White', icon: '⬜' },
    { id: 'transparent', label: 'Checkerboard', icon: '🏁' },
    { id: 'cam', label: 'Camera Overlay', icon: '📷' },
    { id: 'custom', label: 'Custom Tint', icon: '🎨' },
  ];

  return (
    <header className="h-16 px-4 glass-panel border-b border-white/10 flex items-center justify-between z-30 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-[2px] shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-[#0d101a] rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-heading tracking-tight bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              AirCanvas AI
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Live Studio
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">Draw in the air with real-time hand gestures</p>
        </div>
      </div>

      {/* Center Controls: Input Mode & Camera Lifecycle */}
      <div className="flex items-center gap-2">
        {/* Hand vs Mouse Mode Switcher */}
        <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/10">
          <button
            onClick={() => onUpdateSettings(s => ({ ...s, inputMode: 'hand' }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              settings.inputMode === 'hand'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Draw in the air using hand gestures"
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Gesture Mode</span>
          </button>
          <button
            onClick={() => onUpdateSettings(s => ({ ...s, inputMode: 'mouse' }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              settings.inputMode === 'mouse'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Draw with mouse or trackpad fallback"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mouse Mode</span>
          </button>
        </div>

        {/* Camera Toggle Button */}
        {settings.inputMode === 'hand' && (
          <button
            onClick={trackingState.isCameraActive ? onStopCamera : onStartCamera}
            disabled={trackingState.isLoading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              trackingState.isCameraActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {trackingState.isCameraActive ? (
              <>
                <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="hidden lg:inline">Camera Active</span>
              </>
            ) : (
              <>
                <CameraOff className="w-4 h-4 text-rose-400" />
                <span className="hidden lg:inline">Turn On Camera</span>
              </>
            )}
          </button>
        )}

        {/* AI Creativity Studio Button */}
        <button
          onClick={onToggleAIStudio}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isAIStudioOpen
              ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-pink-300 border-pink-500/60 shadow-lg shadow-pink-500/20'
              : 'glass-button text-slate-300 hover:text-white'
          }`}
          title="Open AI Creativity Studio"
        >
          <Wand2 className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline">AI Studio</span>
        </button>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-2">
        {/* Background Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowBgMenu(!showBgMenu);
              setShowExportMenu(false);
            }}
            className="glass-button px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 flex items-center gap-1.5"
            title="Change Canvas Background"
          >
            <span>Canvas BG</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showBgMenu && (
            <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl py-2 shadow-2xl z-50">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">Background Style</div>
              {backgrounds.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    onUpdateSettings(s => ({ ...s, background: b.id }));
                    setShowBgMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/10 transition-colors ${
                    settings.background === b.id ? 'text-cyan-400 font-semibold bg-cyan-500/10' : 'text-slate-300'
                  }`}
                >
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sound FX Toggle */}
        <button
          onClick={() => onUpdateSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
          className="glass-button p-2 rounded-xl text-slate-400 hover:text-slate-200"
          title={settings.soundEnabled ? 'Mute Sound Cues' : 'Unmute Sound Cues'}
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Gesture Guide Cheatsheet Button */}
        <button
          onClick={onOpenGestureGuide}
          className="glass-button p-2 rounded-xl text-slate-400 hover:text-cyan-300"
          title="Gesture Guide & Cheat Sheet"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Gallery Button */}
        <button
          onClick={onOpenGallery}
          className="glass-button px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 flex items-center gap-1.5 hover:text-white"
          title="Open Artwork Gallery"
        >
          <FolderHeart className="w-4 h-4 text-pink-400" />
          <span className="hidden lg:inline">Saved Art</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowExportMenu(!showExportMenu);
              setShowBgMenu(false);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white flex items-center gap-1.5 shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all"
            title="Export Artwork"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-cyan-200" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl py-2 shadow-2xl z-50">
              <button
                onClick={() => {
                  onSaveToGallery();
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors flex items-center gap-2"
              >
                <FolderHeart className="w-3.5 h-3.5 text-pink-400" />
                <span>Save to Gallery</span>
              </button>
              <button
                onClick={() => {
                  onExportPNG();
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save as PNG (High-Res)</span>
              </button>
              <button
                onClick={() => {
                  onExportSVG();
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-purple-500/20 hover:text-purple-300 transition-colors flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export as Vector SVG</span>
              </button>
              <button
                onClick={() => {
                  onShare();
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-pink-500/20 hover:text-pink-300 transition-colors flex items-center gap-2 border-t border-white/10"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Artwork</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
