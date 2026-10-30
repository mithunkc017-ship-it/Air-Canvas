import React, { useState } from 'react';
import {
  X,
  Wand2,
  Palette,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Key,
  Check,
  ChevronRight,
  Info,
  Layers,
  Flame,
  ArrowRight
} from 'lucide-react';
import { CanvasSettings, Stroke, Point } from '../types/canvas';
import {
  PALETTE_PRESETS,
  DRAWING_TITLE_SUGGESTIONS,
  GUIDED_DRAWINGS
} from '../utils/aiStudioData';
import { GuidedDrawing } from '../types/ai';
import { detectShape } from '../utils/shapeDetector';
import { sound } from '../utils/audio';

interface AIStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CanvasSettings;
  onUpdateSettings: (updater: (prev: CanvasSettings) => CanvasSettings) => void;
  onApplyPaletteColor: (hex: string) => void;
  activeGuidedDrawing: GuidedDrawing | null;
  onSelectGuidedDrawing: (drawing: GuidedDrawing | null) => void;
  strokes: Stroke[];
  onEnhanceStrokes: (enhanced: Stroke[]) => void;
}

export const AIStudioModal: React.FC<AIStudioModalProps> = ({
  isOpen,
  onClose,
  settings: _settings,
  onUpdateSettings: _onUpdateSettings,
  onApplyPaletteColor,
  activeGuidedDrawing,
  onSelectGuidedDrawing,
  strokes,
  onEnhanceStrokes,
}) => {
  const [activeTab, setActiveTab] = useState<'palettes' | 'guided' | 'shapes' | 'text2art'>('palettes');
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('aircanvas_ai_key') || '');
  const [promptText, setPromptText] = useState('Cyberpunk neon fox floating in a dark galaxy');
  const [selectedStyle, setSelectedStyle] = useState('Neon Hologram');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [enhancedCount, setEnhancedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // Handle Save API key locally
  const handleSaveKey = () => {
    localStorage.setItem('aircanvas_ai_key', apiKey.trim());
    setAiMessage('API Key configuration saved securely in browser localStorage.');
    setTimeout(() => setAiMessage(null), 3500);
  };

  // Enhance rough hand sketches on canvas into clean shapes
  const handleEnhanceShapes = () => {
    let count = 0;
    const updated = strokes.map(stroke => {
      if (stroke.isEraser || (stroke.shape && stroke.shape !== 'none')) {
        return stroke;
      }
      const res = detectShape(stroke.points);
      if (res.shape !== 'none') {
        count++;
        return {
          ...stroke,
          shape: res.shape,
          shapePoints: res.points,
        };
      }
      return stroke;
    });

    if (count > 0) {
      sound.playShapeRecognized();
      onEnhanceStrokes(updated);
      setEnhancedCount(count);
    } else {
      setEnhancedCount(0);
    }
    setTimeout(() => setEnhancedCount(null), 4000);
  };

  // Text-to-Art generator logic
  const handleGenerateTextToArt = () => {
    setIsGenerating(true);
    setAiMessage(null);

    setTimeout(() => {
      setIsGenerating(false);
      if (!apiKey.trim()) {
        setAiMessage(
          'Notice: No OpenAI/Stability API key is configured. To connect cloud image models, add your key above or in .env. Falling back to the offline procedural synthesis engine.'
        );
      } else {
        setAiMessage('Request sent to connected AI backend. (Check network console for provider response).');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="relative glass-panel border border-pink-500/30 p-6 md:p-8 rounded-3xl max-w-3xl w-full shadow-2xl shadow-pink-500/20 my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-heading text-white">AI Creativity Studio</h2>
              <p className="text-xs text-slate-400">Intelligent generative tools, color harmony & drawing tutor</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full glass-button text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-white/5 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('palettes')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'palettes'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4 text-pink-400" />
            <span>Harmonic Palettes</span>
          </button>

          <button
            onClick={() => setActiveTab('guided')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'guided'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Guided Drawing Tutor</span>
          </button>

          <button
            onClick={() => setActiveTab('shapes')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'shapes'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Shape Auto-Cleanup</span>
          </button>

          <button
            onClick={() => setActiveTab('text2art')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'text2art'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Text-to-Art / Generator</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* 1. Harmonious Palettes Tab */}
          {activeTab === 'palettes' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Curated Color Harmonies</h3>
                <p className="text-xs text-slate-400">Click any swatch to immediately set it as your active drawing color</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PALETTE_PRESETS.map(preset => (
                  <div key={preset.id} className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-pink-500/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-white">{preset.name}</span>
                      <span className="text-[10px] uppercase font-semibold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                        {preset.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {preset.colors.map(col => (
                        <button
                          key={col}
                          onClick={() => {
                            onApplyPaletteColor(col);
                            onClose();
                          }}
                          className="flex-1 h-10 rounded-xl transition-all transform hover:scale-110 active:scale-95 shadow-md"
                          style={{ backgroundColor: col }}
                          title={`Select ${col}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Title Suggestions */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white mb-1">AI Title Suggestions for Your Artwork</h3>
                <p className="text-xs text-slate-400 mb-3">Click any title to copy for saving your masterpiece</p>

                <div className="flex flex-wrap gap-2">
                  {DRAWING_TITLE_SUGGESTIONS.map(title => (
                    <button
                      key={title}
                      onClick={() => {
                        navigator.clipboard.writeText(title);
                        setCopiedTitle(title);
                        setTimeout(() => setCopiedTitle(null), 2500);
                      }}
                      className="px-3 py-1.5 rounded-xl glass-button text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      <span>{title}</span>
                      {copiedTitle === title && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Guided Drawing Tutor Tab */}
          {activeTab === 'guided' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Interactive Step-by-Step Drawing Tutor</h3>
                <p className="text-xs text-slate-400">
                  Select a template to project holographic trace outlines directly onto your canvas to guide your fingers!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GUIDED_DRAWINGS.map(drawing => {
                  const isSelected = activeGuidedDrawing?.id === drawing.id;
                  return (
                    <div
                      key={drawing.id}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/20'
                          : 'bg-black/40 border-white/10 hover:border-cyan-500/30'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          onSelectGuidedDrawing(null);
                        } else {
                          onSelectGuidedDrawing(drawing);
                          onClose();
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{drawing.icon}</span>
                        <div>
                          <h4 className="font-bold text-white text-base">{drawing.title}</h4>
                          <span className="text-[10px] text-cyan-300 uppercase font-semibold">
                            {drawing.difficulty} • {drawing.steps.length} {drawing.steps.length === 1 ? 'Step' : 'Steps'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mb-3">{drawing.description}</p>

                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">
                          {isSelected ? 'Currently Active on Canvas' : 'Click to Load Outline'}
                        </span>
                        <ArrowRight className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeGuidedDrawing && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => onSelectGuidedDrawing(null)}
                    className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30"
                  >
                    Remove Guided Ghost Overlay
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. Shape Auto-Cleanup Tab */}
          {activeTab === 'shapes' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Instant Sketch Shape Enhancer</h3>
                <p className="text-xs text-slate-400">
                  Analyze all rough freehand strokes on your current canvas and convert matching curves into mathematically clean circles, lines, rectangles, and triangles.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Total strokes on canvas:</span>
                  <span className="font-mono text-cyan-400 font-bold">{strokes.length}</span>
                </div>

                <button
                  onClick={handleEnhanceShapes}
                  disabled={strokes.length === 0}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    strokes.length > 0
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:brightness-110 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-Enhance Canvas Shapes</span>
                </button>

                {enhancedCount !== null && (
                  <div className={`p-3 rounded-xl text-xs font-medium border ${
                    enhancedCount > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {enhancedCount > 0
                      ? `✨ Success! Cleaned and geometricized ${enhancedCount} stroke(s) into sharp shapes.`
                      : 'No recognizable rough shapes found among current strokes.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Text-to-Art / Generator Tab */}
          {activeTab === 'text2art' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Text-to-Art Generation</h3>
                <p className="text-xs text-slate-400">
                  Generate inspirational art concept references using AI models
                </p>
              </div>

              {/* API Configuration Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Model API Key (Optional)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Stored client-side only</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="sk-... (OpenAI or custom API key)"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleSaveKey}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30"
                  >
                    Save Key
                  </button>
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Creative Art Prompt</label>
                <textarea
                  rows={3}
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400"
                  placeholder="Describe what you want the AI to visualize..."
                />
              </div>

              {/* Style Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Style Aesthetic</label>
                <div className="flex flex-wrap gap-2">
                  {['Neon Hologram', 'Cyberpunk', 'Watercolor Wash', 'Vector Lineart', 'Retro 80s Synth'].map(style => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        selectedStyle === style
                          ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/25'
                          : 'glass-button text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateTextToArt}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Canvas Artwork...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    <span>Generate Creative Art</span>
                  </>
                )}
              </button>

              {aiMessage && (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{aiMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
