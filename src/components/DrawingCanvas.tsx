import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stroke, TextElement, CanvasSettings, Point } from '../types/canvas';
import { HandTrackingState, Landmark } from '../types/gestures';
import { GuidedDrawing } from '../types/ai';
import { Eye, EyeOff, Sparkles, Move } from 'lucide-react';

interface DrawingCanvasProps {
  settings: CanvasSettings;
  trackingState: HandTrackingState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  strokes: Stroke[];
  currentStrokeRef: React.MutableRefObject<Stroke | null>;
  texts: TextElement[];
  particlesRef: React.MutableRefObject<any[]>;
  onStartStroke: (pt: Point) => void;
  onAddPoint: (pt: Point) => void;
  onEndStroke: () => void;
  onUpdateParticles: () => void;
  activeGuidedDrawing: GuidedDrawing | null;
  onFingertipMoveScreen?: (screenX: number, screenY: number) => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  settings,
  trackingState,
  videoRef,
  strokes,
  currentStrokeRef,
  texts,
  particlesRef,
  onStartStroke,
  onAddPoint,
  onEndStroke,
  onUpdateParticles,
  activeGuidedDrawing,
  onFingertipMoveScreen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement>(null);

  const [showWebcamPiP, setShowWebcamPiP] = useState(true);
  const isMouseDownRef = useRef(false);
  const isDrawingWithHandRef = useRef(false);

  // Resize canvas to match container resolution
  const handleResize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (!container || !canvas || !overlay) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Use actual pixel width
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    overlay.width = rect.width * dpr;
    overlay.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlay.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    if (overlayCtx) overlayCtx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Main rendering loop for drawing canvas, particle physics, and overlays
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const overlay = overlayCanvasRef.current;
      const container = containerRef.current;
      if (!canvas || !overlay || !container) {
        animId = requestAnimationFrame(render);
        return;
      }

      const rect = container.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      const overlayCtx = overlay.getContext('2d');
      if (!ctx || !overlayCtx) {
        animId = requestAnimationFrame(render);
        return;
      }

      // 1. Clear Main Canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Render Camera background if requested
      if (settings.background === 'cam' && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        ctx.translate(rect.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, rect.width, rect.height);
        ctx.restore();
        ctx.fillStyle = 'rgba(9, 11, 16, 0.4)';
        ctx.fillRect(0, 0, rect.width, rect.height);
      } else if (settings.background === 'dark') {
        ctx.fillStyle = '#090a0f';
        ctx.fillRect(0, 0, rect.width, rect.height);
      } else if (settings.background === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
      } else if (settings.background === 'custom') {
        ctx.fillStyle = settings.customBgColor;
        ctx.fillRect(0, 0, rect.width, rect.height);
      }

      // 2. Render Guided Drawing Ghosts (if active)
      if (activeGuidedDrawing) {
        ctx.save();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.globalAlpha = 0.55;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00f0ff';

        for (const step of activeGuidedDrawing.steps) {
          for (const path of step.guidePaths) {
            if (path.length < 2) continue;
            ctx.beginPath();
            ctx.moveTo(path[0].x * rect.width, path[0].y * rect.height);
            for (let i = 1; i < path.length; i++) {
              ctx.lineTo(path[i].x * rect.width, path[i].y * rect.height);
            }
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 3. Render Completed Strokes
      const allStrokes = [...strokes];
      if (currentStrokeRef.current) {
        allStrokes.push(currentStrokeRef.current);
      }

      for (const stroke of allStrokes) {
        const pts = stroke.shapePoints && stroke.shapePoints.length > 0 ? stroke.shapePoints : stroke.points;
        if (pts.length < 2) continue;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = stroke.size;
        ctx.globalAlpha = stroke.opacity;

        if (stroke.isEraser) {
          ctx.globalCompositeOperation = settings.background === 'cam' ? 'destination-out' : 'source-over';
          ctx.strokeStyle = settings.background === 'white' ? '#ffffff' : (settings.background === 'cam' ? 'rgba(0,0,0,1)' : '#090a0f');
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = stroke.color;

          // Brush Specific Shaders
          if (stroke.brush === 'neon') {
            ctx.shadowBlur = stroke.size * 1.6;
            ctx.shadowColor = stroke.color;
          } else if (stroke.brush === 'watercolor') {
            ctx.globalAlpha = stroke.opacity * 0.45;
            ctx.shadowBlur = stroke.size * 0.5;
            ctx.shadowColor = stroke.color;
          } else if (stroke.brush === 'airbrush') {
            ctx.globalAlpha = stroke.opacity * 0.25;
            ctx.shadowBlur = stroke.size * 2;
            ctx.shadowColor = stroke.color;
          }
        }

        // Quadratic smoothing render
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        const last = pts[pts.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();

        ctx.restore();
      }

      // 4. Render Particle Physics
      onUpdateParticles();
      const particles = particlesRef.current;
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.type === 'sparkle') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffffff';
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Render Text Elements
      for (const t of texts) {
        ctx.save();
        ctx.fillStyle = t.color;
        ctx.font = `bold ${t.fontSize}px ${t.fontFamily}`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = t.color;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      }

      // 6. Render Overlay Canvas: Hand Reticle & Fingertip Cursor Indicator
      overlayCtx.clearRect(0, 0, rect.width, rect.height);

      if (settings.inputMode === 'hand' && trackingState.fingertip) {
        const fx = trackingState.fingertip.x * rect.width;
        const fy = trackingState.fingertip.y * rect.height;

        // Notify parent about screen position for color swatch dwell detection
        if (onFingertipMoveScreen) {
          const screenX = rect.left + fx;
          const screenY = rect.top + fy;
          onFingertipMoveScreen(screenX, screenY);
        }

        overlayCtx.save();

        // Fingertip Glowing Aura
        const auraColor = settings.isEraser ? '#ff007f' : settings.color;
        overlayCtx.shadowBlur = 20;
        overlayCtx.shadowColor = auraColor;

        // Outer Reticle Circle
        overlayCtx.beginPath();
        overlayCtx.arc(fx, fy, settings.size / 2 + 8, 0, Math.PI * 2);
        overlayCtx.strokeStyle = auraColor;
        overlayCtx.lineWidth = 2.5;
        overlayCtx.stroke();

        // Inner Core Dot
        overlayCtx.beginPath();
        overlayCtx.arc(fx, fy, Math.max(3, settings.size / 2), 0, Math.PI * 2);
        overlayCtx.fillStyle = auraColor;
        overlayCtx.fill();

        // Gesture Status Tooltip Label
        overlayCtx.shadowBlur = 0;
        overlayCtx.fillStyle = 'rgba(10, 14, 24, 0.85)';
        const label = trackingState.activeGesture === 'draw'
          ? (settings.isEraser ? 'Erasing' : 'Drawing')
          : trackingState.activeGesture === 'navigate'
          ? 'Navigating'
          : trackingState.activeGesture;

        overlayCtx.font = '600 11px system-ui, sans-serif';
        const textWidth = overlayCtx.measureText(label).width;
        overlayCtx.fillRect(fx - textWidth / 2 - 8, fy + settings.size / 2 + 12, textWidth + 16, 20);
        overlayCtx.fillStyle = '#ffffff';
        overlayCtx.fillText(label, fx - textWidth / 2, fy + settings.size / 2 + 26);

        overlayCtx.restore();
      }

      // 7. Update Webcam PiP Canvas if enabled
      if (showWebcamPiP && pipCanvasRef.current && videoRef.current && videoRef.current.readyState >= 2) {
        const pipCanvas = pipCanvasRef.current;
        const pipCtx = pipCanvas.getContext('2d');
        if (pipCtx) {
          pipCtx.clearRect(0, 0, pipCanvas.width, pipCanvas.height);
          pipCtx.save();
          pipCtx.translate(pipCanvas.width, 0);
          pipCtx.scale(-1, 1);
          pipCtx.drawImage(videoRef.current, 0, 0, pipCanvas.width, pipCanvas.height);
          pipCtx.restore();

          // Draw skeleton lines on PiP
          if (trackingState.landmarks && trackingState.landmarks.length >= 21) {
            drawHandSkeleton(pipCtx, trackingState.landmarks, pipCanvas.width, pipCanvas.height);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    settings,
    trackingState,
    strokes,
    currentStrokeRef,
    texts,
    particlesRef,
    activeGuidedDrawing,
    onUpdateParticles,
    showWebcamPiP,
    videoRef,
    onFingertipMoveScreen,
  ]);

  // Hand gesture drawing trigger
  useEffect(() => {
    if (settings.inputMode !== 'hand') return;

    const container = containerRef.current;
    if (!container || !trackingState.fingertip) {
      if (isDrawingWithHandRef.current) {
        onEndStroke();
        isDrawingWithHandRef.current = false;
      }
      return;
    }

    const rect = container.getBoundingClientRect();
    const pt: Point = {
      x: trackingState.fingertip.x * rect.width,
      y: trackingState.fingertip.y * rect.height,
      time: Date.now(),
    };

    if (trackingState.activeGesture === 'draw') {
      if (!isDrawingWithHandRef.current) {
        onStartStroke(pt);
        isDrawingWithHandRef.current = true;
      } else {
        onAddPoint(pt);
      }
    } else {
      if (isDrawingWithHandRef.current) {
        onEndStroke();
        isDrawingWithHandRef.current = false;
      }
    }
  }, [
    settings.inputMode,
    trackingState.fingertip,
    trackingState.activeGesture,
    onStartStroke,
    onAddPoint,
    onEndStroke,
  ]);

  // Mouse fallback drawing listeners
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (settings.inputMode !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pt: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now(),
    };
    isMouseDownRef.current = true;
    onStartStroke(pt);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (settings.inputMode !== 'mouse' || !isMouseDownRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pt: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now(),
    };
    onAddPoint(pt);
  };

  const handleMouseUp = () => {
    if (settings.inputMode !== 'mouse') return;
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      onEndStroke();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 w-full h-full overflow-hidden select-none cursor-crosshair ${
        settings.background === 'transparent' ? 'bg-checkerboard' : ''
      }`}
    >
      {/* Hidden processing video */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Main Drawing Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Overlay Canvas (Reticle & Gestures) */}
      <canvas
        ref={overlayCanvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="absolute inset-0 w-full h-full block pointer-events-auto"
      />

      {/* Guided Drawing Header Banner */}
      {activeGuidedDrawing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 glass-panel border border-cyan-500/40 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl shadow-cyan-500/10">
          <span className="text-xl">{activeGuidedDrawing.icon}</span>
          <div>
            <div className="text-xs font-bold text-white">{activeGuidedDrawing.title}</div>
            <div className="text-[11px] text-cyan-300">
              {activeGuidedDrawing.steps[0].instruction}
            </div>
          </div>
        </div>
      )}

      {/* Picture-in-Picture Webcam Mirror Widget */}
      {settings.inputMode === 'hand' && trackingState.isCameraActive && (
        <div className="absolute bottom-4 left-4 z-20 flex flex-col items-start gap-1">
          <div className="relative glass-panel rounded-2xl overflow-hidden border border-white/20 shadow-2xl p-1 group">
            {showWebcamPiP ? (
              <canvas
                ref={pipCanvasRef}
                width={192}
                height={144}
                className="w-44 h-32 md:w-52 md:h-36 rounded-xl object-cover bg-black/60 block"
              />
            ) : (
              <div className="w-44 h-10 flex items-center justify-center text-xs text-slate-400">
                Webcam minimized
              </div>
            )}

            {/* PiP Header Controls */}
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <button
                onClick={() => setShowWebcamPiP(!showWebcamPiP)}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs transition-colors"
                title={showWebcamPiP ? 'Hide Mirror PiP' : 'Show Mirror PiP'}
              >
                {showWebcamPiP ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-semibold text-cyan-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Mirrored Feed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper: draws hand landmark skeleton lines onto PiP
function drawHandSkeleton(ctx: CanvasRenderingContext2D, landmarks: Landmark[], width: number, height: number) {
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],       // Index
    [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
    [9, 13], [13, 14], [14, 15], [15, 16], // Ring
    [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [0, 17],                              // Palm
  ];

  ctx.save();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
  ctx.lineWidth = 2;

  for (const [i, j] of connections) {
    const a = landmarks[i];
    const b = landmarks[j];
    ctx.beginPath();
    ctx.moveTo(a.x * width, a.y * height);
    ctx.lineTo(b.x * width, b.y * height);
    ctx.stroke();
  }

  // Draw joints
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, i === 8 ? 4 : 2, 0, Math.PI * 2);
    ctx.fillStyle = i === 8 ? '#ff007f' : '#00f0ff';
    ctx.fill();
  }
  ctx.restore();
}
