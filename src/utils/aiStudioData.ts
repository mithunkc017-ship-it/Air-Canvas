import { PalettePreset, GuidedDrawing } from '../types/ai';

export const PALETTE_PRESETS: PalettePreset[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'neon',
    colors: ['#00f0ff', '#ff007f', '#ffe600', '#7928ca', '#00ff66', '#ff003c'],
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon',
    category: 'nature',
    colors: ['#ff4e50', '#f9d423', '#fc913a', '#eb4d4b', '#686de0', '#30336b'],
  },
  {
    id: 'deep-space',
    name: 'Cosmic Nebula',
    category: 'cyberpunk',
    colors: ['#7928ca', '#4338ca', '#38bdf8', '#c084fc', '#f43f5e', '#ffffff'],
  },
  {
    id: 'sakura',
    name: 'Sakura Blossom',
    category: 'pastel',
    colors: ['#ff9a9e', '#fecfef', '#a1c4fd', '#c2e9fb', '#fdcbf1', '#e2d1c3'],
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave 80s',
    category: 'retro',
    colors: ['#ff71ce', '#01cdfe', '#05ffa1', '#b967ff', '#fffb96', '#2b1055'],
  },
  {
    id: 'electric-forest',
    name: 'Electric Forest',
    category: 'nature',
    colors: ['#00ff87', '#60efff', '#10b981', '#064e3b', '#a3e635', '#facc15'],
  },
  {
    id: 'fire-ice',
    name: 'Fire & Ice',
    category: 'neon',
    colors: ['#ff3b00', '#ff8800', '#ffea00', '#00b4d8', '#90e0ef', '#caf0f8'],
  },
  {
    id: 'monochrome-gold',
    name: 'Midnight Gold',
    category: 'retro',
    colors: ['#ffd700', '#ffae00', '#f3f4f6', '#9ca3af', '#4b5563', '#111827'],
  },
];

export const CREATIVE_PROMPT_SUGGESTIONS = [
  'A neon dragon soaring over futuristic skyscrapers',
  'An ethereal glowing jellyfish floating through deep space',
  'A cyberpunk warrior holding an energy sword',
  'A cozy celestial tree with stars as glowing leaves',
  'A retro cassette tape with rainbow soundwaves',
  'A geometric crystal fox with glowing eyes',
  'A magical potion bottle with swirling cosmic mist',
  'An astronaut skating on Saturn\'s rings',
  'A robotic hummingbird pollinating holographic flowers',
  'A flaming phoenix rising into an aurora sky',
];

export const DRAWING_TITLE_SUGGESTIONS = [
  'Neon Starlight Dreams',
  'Cosmic Pulse',
  'Electric Mirage',
  'Whispering Aurora',
  'Midnight Velocity',
  'Celestial Voyage',
  'Cyber Bloom',
  'Ether & Flame',
  'Vibrant Echoes',
  'Luminescent Horizon',
];

// Step-by-step guided drawing outlines (normalized 0..1 scale)
export const GUIDED_DRAWINGS: GuidedDrawing[] = [
  {
    id: 'star',
    title: 'Golden Star',
    icon: '⭐',
    difficulty: 'Easy',
    description: 'A classic 5-pointed celestial star',
    steps: [
      {
        instruction: 'Trace the outer 5-pointed star contour',
        tip: 'Start from top vertex and draw continuous straight edges',
        guidePaths: [
          [
            { x: 0.5, y: 0.15 },
            { x: 0.61, y: 0.38 },
            { x: 0.86, y: 0.38 },
            { x: 0.66, y: 0.54 },
            { x: 0.74, y: 0.78 },
            { x: 0.5, y: 0.62 },
            { x: 0.26, y: 0.78 },
            { x: 0.34, y: 0.54 },
            { x: 0.14, y: 0.38 },
            { x: 0.39, y: 0.38 },
            { x: 0.5, y: 0.15 },
          ],
        ],
      },
    ],
  },
  {
    id: 'cat',
    title: 'Cute Cat Head',
    icon: '🐱',
    difficulty: 'Easy',
    description: 'An adorable kitty face with pointy ears and whiskers',
    steps: [
      {
        instruction: 'Step 1: Draw the head outline and pointy ears',
        guidePaths: [
          [
            { x: 0.3, y: 0.5 },
            { x: 0.25, y: 0.3 },
            { x: 0.4, y: 0.35 },
            { x: 0.6, y: 0.35 },
            { x: 0.75, y: 0.3 },
            { x: 0.7, y: 0.5 },
            { x: 0.65, y: 0.7 },
            { x: 0.35, y: 0.7 },
            { x: 0.3, y: 0.5 },
          ],
        ],
      },
      {
        instruction: 'Step 2: Add cute eyes and little nose',
        guidePaths: [
          [
            { x: 0.38, y: 0.48 },
            { x: 0.42, y: 0.48 },
          ],
          [
            { x: 0.58, y: 0.48 },
            { x: 0.62, y: 0.48 },
          ],
          [
            { x: 0.5, y: 0.54 },
            { x: 0.47, y: 0.58 },
            { x: 0.53, y: 0.58 },
            { x: 0.5, y: 0.54 },
          ],
        ],
      },
      {
        instruction: 'Step 3: Draw the whiskers and smiling mouth',
        guidePaths: [
          [
            { x: 0.22, y: 0.52 },
            { x: 0.35, y: 0.54 },
          ],
          [
            { x: 0.22, y: 0.58 },
            { x: 0.35, y: 0.57 },
          ],
          [
            { x: 0.78, y: 0.52 },
            { x: 0.65, y: 0.54 },
          ],
          [
            { x: 0.78, y: 0.58 },
            { x: 0.65, y: 0.57 },
          ],
        ],
      },
    ],
  },
  {
    id: 'rocket',
    title: 'Cosmic Spaceship',
    icon: '🚀',
    difficulty: 'Medium',
    description: 'An aerodynamic retro rocket blasting off into space',
    steps: [
      {
        instruction: 'Step 1: Draw the sleek rocket body and cone tip',
        guidePaths: [
          [
            { x: 0.5, y: 0.15 },
            { x: 0.62, y: 0.4 },
            { x: 0.6, y: 0.65 },
            { x: 0.4, y: 0.65 },
            { x: 0.38, y: 0.4 },
            { x: 0.5, y: 0.15 },
          ],
        ],
      },
      {
        instruction: 'Step 2: Add the side booster wings and porthole window',
        guidePaths: [
          [
            { x: 0.38, y: 0.5 },
            { x: 0.28, y: 0.7 },
            { x: 0.4, y: 0.65 },
          ],
          [
            { x: 0.62, y: 0.5 },
            { x: 0.72, y: 0.7 },
            { x: 0.6, y: 0.65 },
          ],
          [
            { x: 0.5, y: 0.35 },
            { x: 0.54, y: 0.38 },
            { x: 0.54, y: 0.43 },
            { x: 0.5, y: 0.46 },
            { x: 0.46, y: 0.43 },
            { x: 0.46, y: 0.38 },
            { x: 0.5, y: 0.35 },
          ],
        ],
      },
      {
        instruction: 'Step 3: Draw fiery exhaust flames blasting out!',
        guidePaths: [
          [
            { x: 0.44, y: 0.66 },
            { x: 0.42, y: 0.82 },
            { x: 0.5, y: 0.75 },
            { x: 0.58, y: 0.85 },
            { x: 0.56, y: 0.66 },
          ],
        ],
      },
    ],
  },
  {
    id: 'butterfly',
    title: 'Glowing Butterfly',
    icon: '🦋',
    difficulty: 'Medium',
    description: 'Graceful winged butterfly with swirling antenna',
    steps: [
      {
        instruction: 'Step 1: Draw the slender butterfly body and head',
        guidePaths: [
          [
            { x: 0.5, y: 0.3 },
            { x: 0.5, y: 0.7 },
          ],
          [
            { x: 0.5, y: 0.3 },
            { x: 0.45, y: 0.22 },
          ],
          [
            { x: 0.5, y: 0.3 },
            { x: 0.55, y: 0.22 },
          ],
        ],
      },
      {
        instruction: 'Step 2: Draw the upper and lower majestic wings',
        guidePaths: [
          [
            { x: 0.5, y: 0.35 },
            { x: 0.75, y: 0.2 },
            { x: 0.8, y: 0.45 },
            { x: 0.5, y: 0.5 },
          ],
          [
            { x: 0.5, y: 0.5 },
            { x: 0.75, y: 0.7 },
            { x: 0.6, y: 0.78 },
            { x: 0.5, y: 0.65 },
          ],
          [
            { x: 0.5, y: 0.35 },
            { x: 0.25, y: 0.2 },
            { x: 0.2, y: 0.45 },
            { x: 0.5, y: 0.5 },
          ],
          [
            { x: 0.5, y: 0.5 },
            { x: 0.25, y: 0.7 },
            { x: 0.4, y: 0.78 },
            { x: 0.5, y: 0.65 },
          ],
        ],
      },
    ],
  },
  {
    id: 'flower',
    title: 'Magic Lotus Flower',
    icon: '🌸',
    difficulty: 'Easy',
    description: 'A blooming lotus blossom with layered petals',
    steps: [
      {
        instruction: 'Draw the central petal and blooming side petals',
        guidePaths: [
          [
            { x: 0.5, y: 0.65 },
            { x: 0.45, y: 0.45 },
            { x: 0.5, y: 0.35 },
            { x: 0.55, y: 0.45 },
            { x: 0.5, y: 0.65 },
          ],
          [
            { x: 0.45, y: 0.62 },
            { x: 0.35, y: 0.5 },
            { x: 0.38, y: 0.42 },
            { x: 0.48, y: 0.48 },
          ],
          [
            { x: 0.55, y: 0.62 },
            { x: 0.65, y: 0.5 },
            { x: 0.62, y: 0.42 },
            { x: 0.52, y: 0.48 },
          ],
          [
            { x: 0.5, y: 0.65 },
            { x: 0.5, y: 0.85 },
          ],
        ],
      },
    ],
  },
];
