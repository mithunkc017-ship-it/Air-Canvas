import { Stroke, TextElement, BackgroundType } from '../types/canvas';

/**
 * Exports current artwork as a high-quality clean PNG (without webcam or UI overlay)
 */
export function exportToPNG(
  strokes: Stroke[],
  texts: TextElement[],
  width: number,
  height: number,
  background: BackgroundType,
  customBgColor: string,
  filename = 'aircanvas-art.png'
): void {
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return;

  // Render Background
  if (background === 'dark') {
    ctx.fillStyle = '#0b0d14';
    ctx.fillRect(0, 0, width, height);
  } else if (background === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else if (background === 'custom') {
    ctx.fillStyle = customBgColor;
    ctx.fillRect(0, 0, width, height);
  } else if (background === 'transparent') {
    ctx.clearRect(0, 0, width, height);
  } else {
    // Cam overlay background fallback to dark charcoal for exported art
    ctx.fillStyle = '#0b0d14';
    ctx.fillRect(0, 0, width, height);
  }

  // Render Strokes
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.size;
    ctx.globalAlpha = stroke.opacity;

    if (stroke.isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;

      if (stroke.brush === 'neon') {
        ctx.shadowBlur = stroke.size * 1.5;
        ctx.shadowColor = stroke.color;
      }
    }

    const pointsToRender = stroke.shapePoints && stroke.shapePoints.length > 0
      ? stroke.shapePoints
      : stroke.points;

    ctx.beginPath();
    ctx.moveTo(pointsToRender[0].x, pointsToRender[0].y);
    for (let i = 1; i < pointsToRender.length - 1; i++) {
      const xc = (pointsToRender[i].x + pointsToRender[i + 1].x) / 2;
      const yc = (pointsToRender[i].y + pointsToRender[i + 1].y) / 2;
      ctx.quadraticCurveTo(pointsToRender[i].x, pointsToRender[i].y, xc, yc);
    }
    const last = pointsToRender[pointsToRender.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();

    ctx.restore();
  }

  // Render Texts
  for (const t of texts) {
    ctx.save();
    ctx.fillStyle = t.color;
    ctx.font = `bold ${t.fontSize}px ${t.fontFamily}`;
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }

  // Download
  const dataUrl = offscreen.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Exports drawing as scalable vector graphics (SVG)
 */
export function exportToSVG(
  strokes: Stroke[],
  texts: TextElement[],
  width: number,
  height: number,
  background: BackgroundType,
  customBgColor: string,
  filename = 'aircanvas-art.svg'
): void {
  let bgColor = 'none';
  if (background === 'dark') bgColor = '#0b0d14';
  else if (background === 'white') bgColor = '#ffffff';
  else if (background === 'custom') bgColor = customBgColor;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;

  if (bgColor !== 'none') {
    svgContent += `  <rect width="100%" height="100%" fill="${bgColor}" />\n`;
  }

  for (const stroke of strokes) {
    if (stroke.points.length < 2 || stroke.isEraser) continue;
    const pts = stroke.shapePoints || stroke.points;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    }

    svgContent += `  <path d="${d}" fill="none" stroke="${stroke.color}" stroke-width="${stroke.size}" stroke-linecap="round" stroke-linejoin="round" opacity="${stroke.opacity}" />\n`;
  }

  for (const t of texts) {
    svgContent += `  <text x="${t.x}" y="${t.y}" fill="${t.color}" font-size="${t.fontSize}" font-family="${t.fontFamily}" font-weight="bold">${t.text}</text>\n`;
  }

  svgContent += '</svg>';

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Shares artwork via Web Share API or falls back to PNG download
 */
export async function shareArtwork(
  strokes: Stroke[],
  texts: TextElement[],
  width: number,
  height: number,
  background: BackgroundType,
  customBgColor: string
): Promise<boolean> {
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return false;

  ctx.fillStyle = background === 'white' ? '#ffffff' : (background === 'custom' ? customBgColor : '#0b0d14');
  ctx.fillRect(0, 0, width, height);

  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.size;
    ctx.strokeStyle = stroke.color;
    ctx.globalAlpha = stroke.opacity;
    const pts = stroke.shapePoints || stroke.points;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();
  }

  try {
    const blob = await new Promise<Blob | null>(res => offscreen.toBlob(res, 'image/png'));
    if (blob && navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'aircanvas.png', { type: 'image/png' })] })) {
      const file = new File([blob], 'aircanvas-artwork.png', { type: 'image/png' });
      await navigator.share({
        title: 'AirCanvas AI Artwork',
        text: 'Drawn with my hands in the air using AirCanvas AI!',
        files: [file],
      });
      return true;
    }
  } catch {
    // If share was canceled or unsupported, fallback to PNG download
  }

  exportToPNG(strokes, texts, width, height, background, customBgColor);
  return false;
}
