import { describe, it, expect, beforeEach } from 'vitest';
import { detectShape } from '../utils/shapeDetector';
import { smoothPoint } from '../utils/smoothing';
import { saveArtwork, getSavedArtworks, deleteArtwork } from '../utils/storage';
import { Point } from '../types/canvas';

describe('Shape Detector', () => {
  it('detects a straight line accurately', () => {
    const points: Point[] = [];
    for (let i = 0; i < 20; i++) {
      points.push({ x: i * 10, y: i * 10 });
    }
    const result = detectShape(points);
    expect(result.shape).toBe('line');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('detects a drawn circle accurately', () => {
    const points: Point[] = [];
    const cx = 100, cy = 100, r = 50;
    for (let i = 0; i <= 30; i++) {
      const theta = (i / 30) * Math.PI * 2;
      points.push({
        x: cx + r * Math.cos(theta),
        y: cy + r * Math.sin(theta),
      });
    }
    const result = detectShape(points);
    expect(result.shape).toBe('circle');
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it('returns none for irregular or too few points', () => {
    const result = detectShape([{ x: 10, y: 10 }, { x: 20, y: 20 }]);
    expect(result.shape).toBe('none');
  });
});

describe('Smoothing Utility', () => {
  it('smooths points smoothly between previous and current', () => {
    const prev: Point = { x: 0, y: 0 };
    const curr: Point = { x: 10, y: 10 };
    const smoothed = smoothPoint(curr, prev, 0.5);
    expect(smoothed.x).toBe(5);
    expect(smoothed.y).toBe(5);
  });
});

describe('Local Artwork Storage', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    globalThis.localStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => store.set(key, val),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      length: 0,
    } as unknown as Storage;
  });

  it('saves and retrieves artwork', () => {
    const art = saveArtwork('Cosmic Sunset', [], [], 'dark', '#000000', 'data:image/png;base64,...');
    expect(art.id).toBeDefined();
    expect(art.title).toBe('Cosmic Sunset');

    const loaded = getSavedArtworks();
    expect(loaded.length).toBe(1);
    expect(loaded[0].title).toBe('Cosmic Sunset');

    const updated = deleteArtwork(art.id);
    expect(updated.length).toBe(0);
  });
});
