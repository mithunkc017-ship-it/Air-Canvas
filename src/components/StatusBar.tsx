import React from 'react';
import {
  Activity,
  Hand,
  MousePointer,
  Sparkles,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CanvasSettings } from '../types/canvas';
import { HandTrackingState, GestureType } from '../types/gestures';

interface StatusBarProps {
  settings: CanvasSettings;
  trackingState: HandTrackingState;
}

export const StatusBar: React.FC<StatusBarProps> = ({ settings, trackingState }) => {
  const getGestureBadge = (gesture: GestureType) => {
    switch (gesture) {
      case 'draw':
        return { label: '☝️ Drawing', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'navigate':
        return { label: '✌️ Navigating', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'pause':
        return { label: '✊ Paused', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'menu':
        return { label: '✋ Action Menu', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'pinch':
        return { label: '🤏 Pinching', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' };
      default:
        return { label: 'Waiting for Hand...', color: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  const gestureInfo = getGestureBadge(trackingState.activeGesture);

  return (
    <footer className="h-9 px-4 glass-panel border-t border-white/10 flex items-center justify-between text-xs text-slate-400 z-20 select-none">
      {/* Left: Tracking State & FPS */}
      <div className="flex items-center gap-4">
        {settings.inputMode === 'hand' ? (
          <>
            <div className="flex items-center gap-1.5">
              {trackingState.isCameraActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-medium">Camera Live</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-slate-400">Camera Off</span>
                </>
              )}
            </div>

            {trackingState.isCameraActive && (
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-cyan-300">{trackingState.fps} FPS</span>
              </div>
            )}

            {trackingState.isCameraActive && (
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-slate-500">Confidence:</span>
                <span className="font-mono text-slate-300">
                  {Math.round(trackingState.confidence * 100)}%
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-1.5 text-purple-300 font-medium">
            <MousePointer className="w-3.5 h-3.5" />
            <span>Mouse Tracking Active</span>
          </div>
        )}
      </div>

      {/* Center: Active Gesture Badge */}
      {settings.inputMode === 'hand' && trackingState.isCameraActive && (
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${gestureInfo.color} shadow-sm transition-all`}>
            {gestureInfo.label}
          </span>
        </div>
      )}

      {/* Right: Brush, Color & Size Specs */}
      <div className="flex items-center gap-3">
        {/* Selected Color Chip */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
            style={{ backgroundColor: settings.isEraser ? '#ff007f' : settings.color }}
          />
          <span className="font-mono text-[11px] text-slate-300 uppercase">
            {settings.isEraser ? 'Eraser' : settings.color}
          </span>
        </div>

        <span className="text-slate-600">|</span>

        {/* Brush Size */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Size:</span>
          <span className="font-mono text-slate-300 font-medium">{settings.size}px</span>
        </div>

        {/* Shape assist badge */}
        {settings.shapeAssistance && (
          <>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30 hidden sm:inline">
              Shape Assist
            </span>
          </>
        )}
      </div>
    </footer>
  );
};
