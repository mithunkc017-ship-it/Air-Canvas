export interface PalettePreset {
  id: string;
  name: string;
  category: 'neon' | 'pastel' | 'cyberpunk' | 'nature' | 'retro' | 'custom';
  colors: string[];
}

export interface GuidedStep {
  instruction: string;
  tip?: string;
  // normalized paths [0..1]
  guidePaths: Array<Array<{ x: number; y: number }>>;
}

export interface GuidedDrawing {
  id: string;
  title: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  description: string;
  steps: GuidedStep[];
}

export interface AIGenerationConfig {
  apiKey?: string;
  prompt: string;
  style: 'cyberpunk' | 'oil' | 'watercolor' | 'anime' | 'vector' | 'neon';
  status: 'idle' | 'generating' | 'success' | 'error';
  error?: string;
  resultImage?: string;
}
