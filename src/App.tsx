import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { TopBar } from './components/TopBar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { StatusBar } from './components/StatusBar';
import { DrawingCanvas } from './components/DrawingCanvas';
import { QuickActionMenu } from './components/QuickActionMenu';
import { GestureGuideModal } from './components/GestureGuideModal';
import { AIStudioModal } from './components/AIStudioModal';
import { GalleryModal } from './components/GalleryModal';
import { TextToolModal } from './components/TextToolModal';

import { useHandTracking } from './hooks/useHandTracking';
import { useDrawingEngine } from './hooks/useDrawingEngine';
import { CanvasSettings, Artwork, Stroke, TextElement } from './types/canvas';
import { GuidedDrawing } from './types/ai';
import { sound } from './utils/audio';
import { exportToPNG, exportToSVG, shareArtwork } from './utils/export';
import { getSavedArtworks, saveArtwork } from './utils/storage';
import confetti from 'canvas-confetti';

export function App() {
  // Screen Mode: 'home' (welcome page) | 'studio' (live painting)
  const [isInStudio, setIsInStudio] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<CanvasSettings>({
    color: '#00f0ff',
    brush: 'classic',
    size: 16,
    opacity: 1.0,
    smoothing: 0.5,
    isEraser: false,
    background: 'dark',
    customBgColor: '#1a102f',
    shapeAssistance: true,
    inputMode: 'hand',
    soundEnabled: true,
  });

  // Modal States
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isGestureGuideOpen, setIsGestureGuideOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isTextToolOpen, setIsTextToolOpen] = useState(false);

  // Guided Drawing Active Template
  const [activeGuidedDrawing, setActiveGuidedDrawing] = useState<GuidedDrawing | null>(null);

  // Local Artworks Gallery State
  const [artworks, setArtworks] = useState<Artwork[]>(() => getSavedArtworks());

  // Hand Tracking Hook
  const { state: trackingState, videoRef, startCamera, stopCamera } = useHandTracking();

  // Drawing Engine Hook
  const {
    strokes,
    currentStrokeRef,
    redoStack,
    texts,
    particlesRef,
    startStroke,
    addPoint,
    endStroke,
    undo,
    redo,
    clearCanvas,
    loadArtwork,
    addText,
    removeText,
    updateParticles,
  } = useDrawingEngine(settings);

  // Sync sound mute setting with global audio utility
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Handle Open Palm Quick Action Menu Trigger
  const lastMenuTriggerRef = useRef<number>(0);
  useEffect(() => {
    if (trackingState.activeGesture === 'menu') {
      const now = Date.now();
      if (now - lastMenuTriggerRef.current > 1200) {
        lastMenuTriggerRef.current = now;
        setIsQuickMenuOpen(true);
      }
    }
  }, [trackingState.activeGesture]);

  // Color Swatch Dwell Selection System
  const swatchRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [hoveredColorProgress, setHoveredColorProgress] = useState<{ color: string; progress: number } | null>(null);
  const dwellStartTimeRef = useRef<{ color: string; startTime: number } | null>(null);

  const handleRegisterColorSwatch = useCallback((color: string, el: HTMLElement | null) => {
    if (el) swatchRefs.current.set(color.toLowerCase(), el);
    else swatchRefs.current.delete(color.toLowerCase());
  }, []);

  const handleFingertipMoveScreen = useCallback((screenX: number, screenY: number) => {
    // Only check dwell when user is navigating or pausing (not actively drawing a canvas stroke)
    if (trackingState.activeGesture === 'draw') {
      dwellStartTimeRef.current = null;
      setHoveredColorProgress(null);
      return;
    }

    let foundColor: string | null = null;
    swatchRefs.current.forEach((el, colorHex) => {
      const rect = el.getBoundingClientRect();
      if (
        screenX >= rect.left &&
        screenX <= rect.right &&
        screenY >= rect.top &&
        screenY <= rect.bottom
      ) {
        foundColor = colorHex;
      }
    });

    if (foundColor) {
      const now = performance.now();
      if (!dwellStartTimeRef.current || dwellStartTimeRef.current.color !== foundColor) {
        dwellStartTimeRef.current = { color: foundColor, startTime: now };
        setHoveredColorProgress({ color: foundColor, progress: 0 });
      } else {
        const elapsed = now - dwellStartTimeRef.current.startTime;
        const dwellDuration = 700; // 700ms dwell threshold
        const progress = Math.min(1, elapsed / dwellDuration);

        setHoveredColorProgress({ color: foundColor, progress });

        if (progress >= 1) {
          // Select Color!
          sound.playColorSelect();
          setSettings(s => ({ ...s, color: foundColor!, isEraser: false }));
          dwellStartTimeRef.current = null;
          setHoveredColorProgress(null);

          // Mini celebratory confetti burst
          try {
            confetti({
              particleCount: 18,
              spread: 45,
              origin: { x: screenX / window.innerWidth, y: screenY / window.innerHeight },
              colors: [foundColor, '#ffffff', '#00f0ff'],
            });
          } catch {
            // ignore
          }
        }
      }
    } else {
      dwellStartTimeRef.current = null;
      setHoveredColorProgress(null);
    }
  }, [trackingState.activeGesture]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'e' || e.key === 'E') {
        setSettings(s => ({ ...s, isEraser: !s.isEraser }));
        sound.playToolSwitch();
      } else if (e.key === 'Escape') {
        setIsQuickMenuOpen(false);
        setIsGestureGuideOpen(false);
        setIsAIStudioOpen(false);
        setIsGalleryOpen(false);
        setIsTextToolOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Launch Air Painting Studio
  const handleStartAirPainting = async () => {
    setIsInStudio(true);
    setSettings(s => ({ ...s, inputMode: 'hand' }));
    await startCamera();
  };

  // Launch Studio in Mouse Mode
  const handleStartMouseMode = () => {
    setIsInStudio(true);
    setSettings(s => ({ ...s, inputMode: 'mouse' }));
  };

  // Export Artwork Handlers
  const handleExportPNG = () => {
    exportToPNG(
      strokes,
      texts,
      window.innerWidth,
      window.innerHeight,
      settings.background,
      settings.customBgColor
    );
  };

  const handleExportSVG = () => {
    exportToSVG(
      strokes,
      texts,
      window.innerWidth,
      window.innerHeight,
      settings.background,
      settings.customBgColor
    );
  };

  const handleShare = async () => {
    await shareArtwork(
      strokes,
      texts,
      window.innerWidth,
      window.innerHeight,
      settings.background,
      settings.customBgColor
    );
  };

  // Save current canvas to gallery
  const handleSaveToGallery = (title = 'Air Sketch') => {
    // Generate thumbnail
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 400;
    thumbCanvas.height = 225;
    const ctx = thumbCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = settings.background === 'white' ? '#ffffff' : '#090a0f';
      ctx.fillRect(0, 0, 400, 225);

      const scaleX = 400 / window.innerWidth;
      const scaleY = 225 / window.innerHeight;

      for (const stroke of strokes) {
        if (stroke.points.length < 2 || stroke.isEraser) continue;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = Math.max(2, stroke.size * scaleX);
        ctx.beginPath();
        const pts = stroke.shapePoints || stroke.points;
        ctx.moveTo(pts[0].x * scaleX, pts[0].y * scaleY);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x * scaleX, pts[i].y * scaleY);
        }
        ctx.stroke();
      }
    }

    const previewUrl = thumbCanvas.toDataURL('image/png');
    const newArt = saveArtwork(
      title,
      strokes,
      texts,
      settings.background,
      settings.customBgColor,
      previewUrl
    );
    setArtworks(getSavedArtworks());
    setIsGalleryOpen(true);
  };

  // If on Home Screen, render landing hero
  if (!isInStudio) {
    return (
      <HomeScreen
        onStartAirPainting={handleStartAirPainting}
        onStartMouseMode={handleStartMouseMode}
      />
    );
  }

  // Live Creative Studio Layout
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090a0f] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Studio Top Navigation Bar */}
      <TopBar
        settings={settings}
        trackingState={trackingState}
        onUpdateSettings={setSettings}
        onStartCamera={startCamera}
        onStopCamera={stopCamera}
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
        onShare={handleShare}
        onSaveToGallery={() => handleSaveToGallery()}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenGestureGuide={() => setIsGestureGuideOpen(true)}
        onToggleAIStudio={() => setIsAIStudioOpen(!isAIStudioOpen)}
        isAIStudioOpen={isAIStudioOpen}
      />

      {/* Camera Error Alert Banner (if permission denied or device busy) */}
      {trackingState.error && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 px-4 py-2 text-xs text-rose-200 flex items-center justify-between z-30">
          <span>{trackingState.error}</span>
          <button
            onClick={() => setSettings(s => ({ ...s, inputMode: 'mouse' }))}
            className="px-3 py-1 bg-rose-500/30 hover:bg-rose-500/50 rounded-lg text-white font-bold ml-4"
          >
            Switch to Mouse Mode
          </button>
        </div>
      )}

      {/* 2. Main Studio Canvas Workspace with Sidebars */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Brushes, Eraser, Undo/Redo, Shape Assist */}
        <LeftSidebar
          settings={settings}
          canUndo={strokes.length > 0}
          canRedo={redoStack.length > 0}
          onUpdateSettings={setSettings}
          onUndo={undo}
          onRedo={redo}
          onClear={clearCanvas}
          onOpenTextTool={() => setIsTextToolOpen(true)}
        />

        {/* Center: Live Holographic Canvas */}
        <DrawingCanvas
          settings={settings}
          trackingState={trackingState}
          videoRef={videoRef}
          strokes={strokes}
          currentStrokeRef={currentStrokeRef}
          texts={texts}
          particlesRef={particlesRef}
          onStartStroke={startStroke}
          onAddPoint={addPoint}
          onEndStroke={endStroke}
          onUpdateParticles={updateParticles}
          activeGuidedDrawing={activeGuidedDrawing}
          onFingertipMoveScreen={handleFingertipMoveScreen}
        />

        {/* Right Sidebar: Virtual Color Palette & Sliders */}
        <RightSidebar
          settings={settings}
          trackingState={trackingState}
          onUpdateSettings={setSettings}
          hoveredColorProgress={hoveredColorProgress}
          onRegisterColorSwatch={handleRegisterColorSwatch}
        />
      </div>

      {/* 3. Bottom Studio Status Bar */}
      <StatusBar settings={settings} trackingState={trackingState} />

      {/* Quick Action Modal (Open Palm Gesture) */}
      <QuickActionMenu
        isOpen={isQuickMenuOpen}
        onClose={() => setIsQuickMenuOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onUndo={undo}
        onRedo={redo}
        onClear={clearCanvas}
      />

      {/* Gesture Cheat Sheet Modal */}
      <GestureGuideModal
        isOpen={isGestureGuideOpen}
        onClose={() => setIsGestureGuideOpen(false)}
      />

      {/* AI Creativity Studio Modal */}
      <AIStudioModal
        isOpen={isAIStudioOpen}
        onClose={() => setIsAIStudioOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onApplyPaletteColor={hex => setSettings(s => ({ ...s, color: hex, isEraser: false }))}
        activeGuidedDrawing={activeGuidedDrawing}
        onSelectGuidedDrawing={setActiveGuidedDrawing}
        strokes={strokes}
        onEnhanceStrokes={enhanced => loadArtwork(enhanced, texts)}
      />

      {/* Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        artworks={artworks}
        onLoadArtwork={art => {
          loadArtwork(art.strokes, art.texts);
          setSettings(s => ({
            ...s,
            background: art.background,
            customBgColor: art.customBgColor,
          }));
        }}
        onDeleteArtwork={setArtworks}
        onNewArtwork={() => clearCanvas()}
      />

      {/* Text Tool Modal */}
      <TextToolModal
        isOpen={isTextToolOpen}
        onClose={() => setIsTextToolOpen(false)}
        currentColor={settings.color}
        onAddText={addText}
      />
    </div>
  );
}

export default App;
