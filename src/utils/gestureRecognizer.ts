import { GestureType, Landmark } from '../types/gestures';

/**
 * Calculates Euclidean distance between two 3D or 2D landmarks
 */
export function getDistance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Detects whether a finger is extended based on tip vs PIP/MCP distance from wrist
 */
export function isFingerExtended(
  landmarks: Landmark[],
  tipIdx: number,
  pipIdx: number,
  mcpIdx: number
): boolean {
  const wrist = landmarks[0];
  const tipDist = getDistance(landmarks[tipIdx], wrist);
  const pipDist = getDistance(landmarks[pipIdx], wrist);
  const mcpDist = getDistance(landmarks[mcpIdx], wrist);

  // When extended, tip is significantly further from wrist than PIP & MCP
  return tipDist > pipDist * 1.15 && tipDist > mcpDist * 1.25;
}

/**
 * Checks if thumb is extended
 */
export function isThumbExtended(landmarks: Landmark[]): boolean {
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const pinkyMcp = landmarks[17];
  const indexMcp = landmarks[5];

  // Thumb tip should be away from the palm center (index MCP / pinky MCP)
  const distToPinky = getDistance(thumbTip, pinkyMcp);
  const distToWrist = getDistance(thumbTip, wrist);
  const indexMcpToWrist = getDistance(indexMcp, wrist);

  return distToPinky > 0.22 || distToWrist > indexMcpToWrist * 0.95;
}

export interface GestureResult {
  gesture: GestureType;
  confidence: number;
  isPinching: boolean;
  pinchDistance: number;
  fingertip: { x: number; y: number };
}

/**
 * Classifies the hand pose into one of the AirCanvas gestures
 */
export function recognizeGesture(landmarks: Landmark[]): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      gesture: 'idle',
      confidence: 0,
      isPinching: false,
      pinchDistance: 1,
      fingertip: { x: 0.5, y: 0.5 },
    };
  }

  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];

  // Pinch distance: normalized Euclidean distance between thumb tip (4) and index tip (8)
  const pinchDistance = getDistance(thumbTip, indexTip);
  const isPinching = pinchDistance < 0.075;

  const indexExtended = isFingerExtended(landmarks, 8, 6, 5);
  const middleExtended = isFingerExtended(landmarks, 12, 10, 9);
  const ringExtended = isFingerExtended(landmarks, 16, 14, 13);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18, 17);
  const thumbExtended = isThumbExtended(landmarks);

  const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

  let gesture: GestureType = 'unknown';
  let confidence = 0.85;

  // 1. Pinch gesture: thumb & index close together
  if (isPinching) {
    gesture = 'pinch';
    confidence = Math.max(0.7, 1 - pinchDistance * 8);
  }
  // 2. Open palm: all 4 fingers extended + thumb extended
  else if (extendedCount >= 4 && thumbExtended) {
    gesture = 'menu';
    confidence = 0.95;
  }
  // 3. Fist / Pause: 0 or 1 finger extended (excluding thumb)
  else if (extendedCount === 0 && !thumbExtended) {
    gesture = 'pause';
    confidence = 0.9;
  }
  // 4. Navigate / Pointer: Index and Middle both extended, Ring & Pinky curled
  else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    gesture = 'navigate';
    confidence = 0.92;
  }
  // 5. Draw: Index finger extended alone
  else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    gesture = 'draw';
    confidence = 0.94;
  } else {
    gesture = 'unknown';
    confidence = 0.5;
  }

  return {
    gesture,
    confidence,
    isPinching,
    pinchDistance,
    fingertip: { x: indexTip.x, y: indexTip.y },
  };
}
