# AirCanvas AI — Real-Time Gesture-Based Drawing Studio 🎨✨

**AirCanvas AI** is an advanced computer vision web application that allows you to paint in the air using your bare hands in front of your webcam. Powered by **MediaPipe Hand Landmarker** and high-performance HTML Canvas 2D, finger movements create digital artwork on your screen in real time with zero latency.

---

## 🌟 Key Features

### 1. Zero-Touch Computer Vision Air Painting
- **Fingertip Tracking**: Sub-millisecond tracking of 21 3D hand landmarks using Google MediaPipe.
- **Natural Gestures**:
  - ☝️ **Index finger extended**: Draw active stroke.
  - ✌️ **Index & middle extended (Peace sign)**: Lift brush to hover and navigate without leaving marks.
  - ✊ **Closed fist**: Pause drawing and rest your hand.
  - ✋ **Open palm**: Opens the rapid **Quick-Action Studio Menu** (Undo, Redo, Eraser, Random Color).
  - 🤏 **Thumb-index pinch**: Precision picking and interaction.
- **Mouse & Trackpad Fallback**: Seamless one-click switch between Gesture Mode and Mouse Mode.

### 2. Holographic Virtual Color Palette
- **Hover/Dwell Selection**: Hover your index fingertip over any of the 28 predefined color swatches for 0.7s to automatically select it, complete with audio chime feedback and celebratory particle bursts!
- **Color Ranges**: Neon Cyberpunk, Vivid Bold, Soft Pastels, Essentials, and custom HTML5 Color Picker.
- **Live Finger Aura**: Glowing cursor attached to fingertip reflecting the selected brush color.

### 3. Magic Brush Engine
- **8 Dynamic Brush Types**:
  - `Classic Paint`: Smooth, opaque acrylic strokes.
  - `Neon Glow`: Luminescent laser glow effect.
  - `Rainbow Stream`: Dynamic hue-shifting prism spectrum.
  - `Fire Particles`: Blazing rising embers with real-time physics.
  - `Sparkle Dust`: Shimmering stardust trail.
  - `Watercolor`: Bleeding fluid wash.
  - `Soft Airbrush`: Feathered misty spray.
  - `Pixel Retro`: 8-bit stepped digital pixels.
- **Brush Controls**: Real-time sliders for stroke thickness (2px – 80px), opacity, and adaptive Bézier curve smoothing.
- **Eraser Tool**: Smooth stroke removal.
- **Canvas Backgrounds**: Dark Charcoal, Clean White, Transparent Checkerboard, Mirrored Camera Overlay, or Custom Tint.

### 4. AI Creativity Studio
- **Shape Auto-Cleanup**: Automatically detects rough hand-drawn circles, lines, rectangles, and triangles and snaps them into mathematical geometric perfection.
- **Interactive Guided Drawing Tutor**: Overlay holographic outline templates to learn drawing step-by-step (Golden Star, Cute Cat, Cosmic Spaceship, Glowing Butterfly, Magic Lotus).
- **Harmonic Palettes & Titles**: Curated palette recommendations and poetic artwork title suggestions.
- **Text Tool**: Place customizable typed text elements anywhere on canvas.
- **Text-to-Art Concept Synthesizer**: Connect an optional API key or use procedural generation.

### 5. Export & Gallery Persistence
- **Export to High-Res PNG**: Exports drawing with your chosen background without webcam feed or UI overlays.
- **Export to Vector SVG**: Resolution-independent vector graphic export.
- **Native Web Share**: Direct sharing on supported devices.
- **Local Artworks Gallery**: Saved in browser `localStorage` with thumbnails, allowing you to reload previous sessions or delete them at will.

---

## 🔒 100% Privacy Guarantee

All camera video streams and MediaPipe computer vision inferences run **strictly locally** inside your web browser. No webcam feeds or camera snapshots are ever transmitted, recorded, or stored on any external server.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- Modern desktop or laptop web browser (Chrome, Edge, Brave, Firefox, or Safari) with webcam access

### Installation

```bash
# 1. Clone or navigate to the workspace
cd draw_color

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Testing & Production Build

### Run Unit Tests
AirCanvas AI includes a full Vitest test suite covering gesture classification, shape detection algorithms, Bézier curve smoothing, and local storage:

```bash
npm test
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🖐️ Gesture Reference Guide

| Gesture | Hand Pose | Studio Action |
| :--- | :--- | :--- |
| **Draw** | ☝️ Index extended, others curled | Paints active stroke on canvas |
| **Navigate** | ✌️ Index + Middle extended | Moves cursor without drawing |
| **Pause** | ✊ Closed fist | Pauses drawing |
| **Quick Menu** | ✋ Open palm (5 fingers spread) | Opens radial action menu |
| **Pinch** | 🤏 Thumb & Index tips close | Activates color swatch or control |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript
- **Bundler & Tooling**: Vite 8, Tailwind CSS v4
- **Computer Vision**: Google MediaPipe Tasks Vision (`@mediapipe/tasks-vision`)
- **Graphics**: HTML5 2D Canvas with requestAnimationFrame rendering
- **Audio**: Web Audio API (Synthesized client-side sound cues)
- **Icons**: Lucide React
- **Testing**: Vitest

---

## 💡 Troubleshooting & Tips

1. **Camera Permission Denied**:
   - Check your browser URL address bar to ensure camera permissions are set to "Allow".
   - If another app (Zoom, Teams, etc.) is currently using your camera, close it and click "Turn On Camera".
2. **Lighting & Tracking Quality**:
   - Sit roughly 1.5 to 3 feet (0.5 – 1 meter) in front of the camera.
   - Frontal illumination produces the best tracking contrast.
3. **Hardware Acceleration**:
   - Enable "Hardware Acceleration" in your browser settings to allow WebGL / WebGPU acceleration for MediaPipe.
