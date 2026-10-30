import React from 'react';
import { X, Sparkles, CheckCircle2, Lightbulb, Camera, Sun } from 'lucide-react';

interface GestureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GestureGuideModal: React.FC<GestureGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const gestures = [
    {
      emoji: '☝️',
      name: 'Index Finger Pointing',
      action: 'Draw Active Stroke',
      desc: 'Extend only your index finger while curling thumb, middle, ring, and pinky. Smooth colored strokes will follow your fingertip.',
      color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
    },
    {
      emoji: '✌️',
      name: 'Peace Sign (Two Fingers)',
      action: 'Navigate / Stop Drawing',
      desc: 'Extend both index and middle fingers. This lifts the virtual brush so you can reposition your hand without leaving a mark.',
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    },
    {
      emoji: '✊',
      name: 'Closed Fist',
      action: 'Pause Drawing',
      desc: 'Make a fist with all fingers curled into your palm. This instantly pauses drawing so you can rest your arm.',
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    },
    {
      emoji: '✋',
      name: 'Open Palm',
      action: 'Quick Action Menu',
      desc: 'Spread all 5 fingers open facing the camera. Pops up the fast radial action menu for undo, redo, eraser, and color swaps.',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    },
    {
      emoji: '🤏',
      name: 'Thumb-Index Pinch',
      action: 'Pinch & Pick',
      desc: 'Bring thumb and index fingertips together. Can be used to tap color swatches or activate UI buttons directly in the air.',
      color: 'border-pink-500/40 bg-pink-500/10 text-pink-300',
    },
  ];

  const tips = [
    'Position yourself 1.5 to 3 feet (0.5 – 1 meter) in front of your webcam.',
    'Ensure good front lighting so your hand is clearly visible without strong backlight.',
    'Keep your hand within the camera frame for continuous smooth tracking.',
    'Hover your fingertip over any color swatch for 0.7s to automatically select that color.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="relative glass-panel border border-white/20 p-6 md:p-8 rounded-3xl max-w-2xl w-full shadow-2xl shadow-cyan-500/20 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-button text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-white">Hand Gesture Master Guide</h2>
            <p className="text-xs text-slate-400">Master intuitive air-painting gestures in seconds</p>
          </div>
        </div>

        {/* Gestures List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
          {gestures.map(g => (
            <div
              key={g.name}
              className={`p-4 rounded-2xl border ${g.color} flex flex-col justify-between transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{g.emoji}</span>
                <div>
                  <h4 className="font-bold text-sm text-white">{g.name}</h4>
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{g.action}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>

        {/* Pro Tips Box */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Lightbulb className="w-4 h-4" />
            <span>Tips for Best Accuracy</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Got it button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Got It, Let's Paint!
          </button>
        </div>
      </div>
    </div>
  );
};
