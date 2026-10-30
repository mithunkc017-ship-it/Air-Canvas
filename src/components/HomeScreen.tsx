import React from 'react';
import {
  Sparkles,
  Camera,
  Hand,
  Palette,
  Wand2,
  ShieldCheck,
  MousePointer,
  Layers,
  Zap,
  ArrowRight
} from 'lucide-react';

interface HomeScreenProps {
  onStartAirPainting: () => void;
  onStartMouseMode: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartAirPainting,
  onStartMouseMode,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-y-auto overflow-x-hidden bg-[#07090e] text-slate-100 p-6 md:p-12">
      {/* Background ambient neon glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/3 translate-y-1/3 w-[30rem] h-[30rem] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-subtle border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 shadow-lg shadow-cyan-500/10 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Next-Gen Computer Vision Creative Studio</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading tracking-tight leading-[1.1] mb-6">
          Paint in the Air with{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-500 bg-clip-text text-transparent">
            Your Bare Hands
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl font-light mb-10 leading-relaxed">
          AirCanvas AI turns your webcam into a magical holographic canvas. Point your finger to draw,
          pinch to select vibrant colors, and create dazzling digital art without touching the screen.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onStartAirPainting}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
          >
            <Camera className="w-6 h-6 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span>Start Air Painting</span>
            <ArrowRight className="w-5 h-5 text-purple-200 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onStartMouseMode}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl glass-panel text-slate-300 hover:text-white font-medium text-base flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            <MousePointer className="w-5 h-5 text-purple-400" />
            <span>Try with Mouse</span>
          </button>
        </div>

        {/* Privacy & Safety Guarantee */}
        <div className="flex items-center gap-2 mt-6 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>100% Private: Video is processed locally in your browser. No webcam feed is ever saved or uploaded.</span>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl my-12">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
            <Hand className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-white mb-1">Fingertip Tracking</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sub-millisecond hand landmark recognition powered by MediaPipe. Tracks index fingertip for silky-smooth painting.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-pink-500/40 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 text-pink-400 group-hover:scale-110 transition-transform">
            <Palette className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-white mb-1">Hover Color Swatches</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Innovative virtual palette. Hover your fingertip over 24+ neon & pastel swatches to auto-select with audio cues.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-white mb-1">8 Magic Brushes</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Paint with neon glow, fire particles, sparkling fairy dust, rainbow gradients, watercolor, and soft airbrush.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
            <Wand2 className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-white mb-1">AI Creativity Studio</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Shape-assist geometry auto-correction, step-by-step guided drawing teacher, and smart palette inspiration.
          </p>
        </div>
      </div>

      {/* Quick Gesture Cheatsheet Preview */}
      <div className="relative z-10 w-full max-w-4xl glass-panel-subtle p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-around gap-4 text-center">
        <div className="flex items-center gap-3">
          <div className="text-2xl">☝️</div>
          <div className="text-left">
            <div className="text-xs font-bold text-cyan-300">Point Index Finger</div>
            <div className="text-[11px] text-slate-400">Draw active stroke</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xl">✌️</div>
          <div className="text-left">
            <div className="text-xs font-bold text-purple-300">Peace Sign (2 Fingers)</div>
            <div className="text-[11px] text-slate-400">Navigate / Stop drawing</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xl">✊</div>
          <div className="text-left">
            <div className="text-xs font-bold text-amber-300">Closed Fist</div>
            <div className="text-[11px] text-slate-400">Pause stroke</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xl">✋</div>
          <div className="text-left">
            <div className="text-xs font-bold text-emerald-300">Open Palm</div>
            <div className="text-[11px] text-slate-400">Quick-Action Menu</div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="relative z-10 mt-8 text-center text-xs text-slate-500">
        AirCanvas AI • Created with MediaPipe & React • No installation or special hardware required
      </footer>
    </div>
  );
};
