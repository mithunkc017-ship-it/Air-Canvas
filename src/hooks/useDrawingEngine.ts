import { useState, useRef, useCallback } from 'react';
import { Stroke, Point, CanvasSettings, TextElement, Particle } from '../types/canvas';
import { smoothPoint } from '../utils/smoothing';
import { detectShape } from '../utils/shapeDetector';
import { sound } from '../utils/audio';

export function useDrawingEngine(settings: CanvasSettings) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[][]>([]);
  const [texts, setTexts] = useState<TextElement[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rainbowHueRef = useRef<number>(0);

  // Start a new stroke
  const startStroke = useCallback(
    (point: Point) => {
      const newStroke: Stroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        points: [point],
        color: settings.color,
        size: settings.size,
        opacity: settings.opacity,
        brush: settings.brush,
        isEraser: settings.isEraser,
      };

      currentStrokeRef.current = newStroke;
      sound.playDrawStart();
    },
    [settings]
  );

  // Add a point to the current stroke
  const addPoint = useCallback(
    (point: Point) => {
      const current = currentStrokeRef.current;
      if (!current) return;

      const lastPoint = current.points[current.points.length - 1];
      const smoothed = smoothPoint(point, lastPoint, settings.smoothing);

      // Rainbow brush color update
      if (current.brush === 'rainbow') {
        rainbowHueRef.current = (rainbowHueRef.current + 4) % 360;
        current.color = `hsl(${rainbowHueRef.current}, 100%, 55%)`;
      }

      current.points.push(smoothed);

      // Spawn particles for dynamic brushes
      if (current.brush === 'fire') {
        for (let i = 0; i < 3; i++) {
          const colors = ['#ff3b00', '#ff8800', '#ffea00', '#ffffff'];
          particlesRef.current.push({
            x: smoothed.x + (Math.random() - 0.5) * current.size * 0.8,
            y: smoothed.y + (Math.random() - 0.5) * current.size * 0.8,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 2.5 - 1.0,
            size: Math.random() * (current.size * 0.5) + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.9,
            life: 0,
            maxLife: 20 + Math.random() * 15,
            type: 'fire',
          });
        }
      } else if (current.brush === 'sparkle') {
        for (let i = 0; i < 2; i++) {
          particlesRef.current.push({
            x: smoothed.x + (Math.random() - 0.5) * current.size,
            y: smoothed.y + (Math.random() - 0.5) * current.size,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 5 + 2,
            color: '#ffffff',
            alpha: 1,
            life: 0,
            maxLife: 25,
            type: 'sparkle',
          });
        }
      }
    },
    [settings.smoothing]
  );

  // End the current stroke
  const endStroke = useCallback(() => {
    const current = currentStrokeRef.current;
    if (!current) return;

    if (current.points.length >= 2) {
      // Shape assistance check if enabled and not eraser
      if (settings.shapeAssistance && !current.isEraser) {
        const detected = detectShape(current.points);
        if (detected.shape !== 'none') {
          current.shape = detected.shape;
          current.shapePoints = detected.points;
          sound.playShapeRecognized();
        }
      }

      setStrokes(prev => [...prev, current]);
      setRedoStack([]); // Clear redo stack on new action
    }

    currentStrokeRef.current = null;
  }, [settings.shapeAssistance]);

  // Undo
  const undo = useCallback(() => {
    setStrokes(prev => {
      if (prev.length === 0) return prev;
      const lastStroke = prev[prev.length - 1];
      setRedoStack(r => [...r, [lastStroke]]);
      sound.playUndo();
      return prev.slice(0, prev.length - 1);
    });
  }, []);

  // Redo
  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const toRestore = prev[prev.length - 1];
      setStrokes(s => [...s, ...toRestore]);
      sound.playUndo();
      return prev.slice(0, prev.length - 1);
    });
  }, []);

  // Clear Canvas
  const clearCanvas = useCallback(() => {
    if (strokes.length > 0) {
      setRedoStack(r => [...r, strokes]);
      setStrokes([]);
      setTexts([]);
      sound.playClear();
    }
  }, [strokes]);

  // Load saved artwork state
  const loadArtwork = useCallback((savedStrokes: Stroke[], savedTexts: TextElement[]) => {
    setStrokes(savedStrokes);
    setTexts(savedTexts);
    setRedoStack([]);
  }, []);

  // Add Text Element
  const addText = useCallback((textEl: TextElement) => {
    setTexts(prev => [...prev, textEl]);
  }, []);

  // Remove Text Element
  const removeText = useCallback((id: string) => {
    setTexts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Update particles physics in animation frame
  const updateParticles = useCallback(() => {
    const active: Particle[] = [];
    for (const p of particlesRef.current) {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.type === 'fire') {
        p.size = Math.max(0.5, p.size * 0.96);
      }

      if (p.life < p.maxLife && p.alpha > 0.05) {
        active.push(p);
      }
    }
    particlesRef.current = active;
  }, []);

  return {
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
  };
}
