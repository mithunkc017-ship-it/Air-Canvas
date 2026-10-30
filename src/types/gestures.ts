export type GestureType = 
  | 'idle'        // No hand or indeterminate
  | 'draw'        // Index finger extended alone
  | 'navigate'    // Index + Middle fingers extended (peace / pointer)
  | 'pause'       // Fist / all curled
  | 'menu'        // Open palm (all fingers extended)
  | 'pinch'       // Thumb & index pinch
  | 'unknown';

export interface Landmark {
  x: number; // Normalized 0..1
  y: number; // Normalized 0..1
  z: number; // Depth relative to wrist
}

export interface HandTrackingState {
  isReady: boolean;
  isLoading: boolean;
  hasPermission: boolean;
  isCameraActive: boolean;
  error: string | null;
  landmarks: Landmark[] | null;
  fingertip: { x: number; y: number } | null;
  activeGesture: GestureType;
  confidence: number;
  fps: number;
  isPinching: boolean;
  pinchDistance: number;
}
