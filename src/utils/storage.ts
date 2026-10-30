import { Artwork, Stroke, TextElement, BackgroundType } from '../types/canvas';

const STORAGE_KEY = 'aircanvas_artworks_v1';

export function getSavedArtworks(): Artwork[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved artworks', e);
    return [];
  }
}

export function saveArtwork(
  title: string,
  strokes: Stroke[],
  texts: TextElement[],
  background: BackgroundType,
  customBgColor: string,
  previewDataUrl: string
): Artwork {
  const artworks = getSavedArtworks();
  const newArtwork: Artwork = {
    id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: title.trim() || `Air Sketch #${artworks.length + 1}`,
    previewUrl: previewDataUrl,
    createdAt: Date.now(),
    strokes,
    texts,
    background,
    customBgColor,
  };

  artworks.unshift(newArtwork);
  // Keep up to 25 artworks locally
  const trimmed = artworks.slice(0, 25);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('LocalStorage quota reached, saving without largest thumbnails', e);
  }

  return newArtwork;
}

export function deleteArtwork(id: string): Artwork[] {
  const artworks = getSavedArtworks().filter(a => a.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(artworks));
  } catch (e) {
    console.error('Failed to update localStorage', e);
  }
  return artworks;
}
