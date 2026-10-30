export type BrushType = 
  | 'classic'
  | 'neon'
  | 'rainbow'
  | 'fire'
  | 'watercolor'
  | 'sparkle'
  | 'airbrush'
  | 'pixel';

export type ShapeType = 'none' | 'line' | 'circle' | 'rectangle' | 'triangle';

export type BackgroundType = 'dark' | 'white' | 'transparent' | 'cam' | 'custom';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  time?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  brush: BrushType;
  isEraser?: boolean;
  shape?: ShapeType;
  shapePoints?: Point[]; // Recognized smoothed shape geometry
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  fontFamily: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'fire' | 'sparkle' | 'watercolor';
}

export interface CanvasSettings {
  color: string;
  brush: BrushType;
  size: number;
  opacity: number;
  smoothing: number; // 0..1 (0 = raw points, 0.7 = silky smooth)
  isEraser: boolean;
  background: BackgroundType;
  customBgColor: string;
  shapeAssistance: boolean;
  inputMode: 'hand' | 'mouse';
  soundEnabled: boolean;
}

export interface Artwork {
  id: string;
  title: string;
  previewUrl: string;
  createdAt: number;
  strokes: Stroke[];
  texts: TextElement[];
  background: BackgroundType;
  customBgColor: string;
}
