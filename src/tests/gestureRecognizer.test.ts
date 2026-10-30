import { describe, it, expect } from 'vitest';
import { recognizeGesture, getDistance } from '../utils/gestureRecognizer';
import { Landmark } from '../types/gestures';

describe('Gesture Recognizer', () => {
  it('calculates Euclidean distance correctly', () => {
    const a: Landmark = { x: 0, y: 0, z: 0 };
    const b: Landmark = { x: 3, y: 4, z: 0 };
    expect(getDistance(a, b)).toBe(5);
  });

  it('recognizes pinch gesture when thumb and index tips are close', () => {
    // 21 dummy landmarks where thumb tip (4) and index tip (8) are practically touching
    const landmarks: Landmark[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
    landmarks[4] = { x: 0.5, y: 0.5, z: 0 };
    landmarks[8] = { x: 0.51, y: 0.51, z: 0 }; // distance ~0.014 < 0.075

    const result = recognizeGesture(landmarks);
    expect(result.isPinching).toBe(true);
    expect(result.gesture).toBe('pinch');
  });

  it('recognizes idle gesture on empty or invalid landmarks', () => {
    const result = recognizeGesture([]);
    expect(result.gesture).toBe('idle');
  });
});
