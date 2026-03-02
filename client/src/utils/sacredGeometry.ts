/**
 * Sacred Geometry & Temporal Design System
 * Integrates Flower of Life, Golden Ratio, Mandala patterns
 * Maps healing frequencies to visual representations
 */

// Solfeggio Frequencies and their properties
export const SOLFEGGIO_FREQUENCIES = {
  '174': {
    hz: 174,
    name: 'Root Grounding',
    chakra: 'Root',
    color: 'oklch(45% 0.15 25)', // Deep red
    description: 'Foundation, safety, grounding',
    benefits: ['Stress relief', 'Physical healing', 'Grounding'],
  },
  '285': {
    hz: 285,
    name: 'Tissue Repair',
    chakra: 'Root',
    color: 'oklch(50% 0.18 30)', // Red
    description: 'Cellular repair and regeneration',
    benefits: ['Healing', 'Energy', 'Vitality'],
  },
  '396': {
    hz: 396,
    name: 'Liberation',
    chakra: 'Sacral',
    color: 'oklch(55% 0.20 35)', // Orange
    description: 'Release fear and guilt',
    benefits: ['Emotional release', 'Transformation', 'Liberation'],
  },
  '417': {
    hz: 417,
    name: 'Undoing Situations',
    chakra: 'Sacral',
    color: 'oklch(60% 0.22 40)', // Orange-yellow
    description: 'Facilitate change and transitions',
    benefits: ['Change', 'Transition', 'Creativity'],
  },
  '432': {
    hz: 432,
    name: 'Harmony',
    chakra: 'Solar Plexus',
    color: 'oklch(65% 0.25 60)', // Yellow
    description: 'Universal harmony and tuning',
    benefits: ['Balance', 'Harmony', 'Clarity'],
  },
  '528': {
    hz: 528,
    name: 'Transformation',
    chakra: 'Heart',
    color: 'oklch(60% 0.28 130)', // Green
    description: 'Love, healing, and DNA repair',
    benefits: ['Love', 'Healing', 'Transformation'],
  },
  '639': {
    hz: 639,
    name: 'Connection',
    chakra: 'Throat',
    color: 'oklch(55% 0.25 200)', // Cyan
    description: 'Communication and relationships',
    benefits: ['Communication', 'Connection', 'Harmony'],
  },
  '741': {
    hz: 741,
    name: 'Awakening',
    chakra: 'Third Eye',
    color: 'oklch(50% 0.20 270)', // Blue
    description: 'Intuition and inner vision',
    benefits: ['Intuition', 'Clarity', 'Awakening'],
  },
  '963': {
    hz: 963,
    name: 'Divine Connection',
    chakra: 'Crown',
    color: 'oklch(45% 0.15 300)', // Violet
    description: 'Spiritual awakening and connection',
    benefits: ['Spirituality', 'Connection', 'Transcendence'],
  },
};

// Golden Ratio for UI proportions
export const GOLDEN_RATIO = 1.618033988749895;

// Sacred geometry patterns
export const SACRED_PATTERNS = {
  flowerOfLife: {
    name: 'Flower of Life',
    circles: 19,
    description: 'Ancient symbol of creation and interconnection',
    svg: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <circle id="circle" cx="100" cy="100" r="30" fill="none" stroke="currentColor" stroke-width="1"/>
        </defs>
        <!-- Center circle -->
        <use href="#circle" x="0" y="0"/>
        <!-- First ring (6 circles) -->
        <use href="#circle" x="30" y="0"/>
        <use href="#circle" x="-30" y="0"/>
        <use href="#circle" x="15" y="26"/>
        <use href="#circle" x="-15" y="26"/>
        <use href="#circle" x="15" y="-26"/>
        <use href="#circle" x="-15" y="-26"/>
        <!-- Second ring (6 circles) -->
        <use href="#circle" x="60" y="0"/>
        <use href="#circle" x="-60" y="0"/>
        <use href="#circle" x="30" y="52"/>
        <use href="#circle" x="-30" y="52"/>
        <use href="#circle" x="30" y="-52"/>
        <use href="#circle" x="-30" y="-52"/>
      </svg>
    `,
  },
  mandala: {
    name: 'Mandala',
    rings: 7,
    description: 'Circular design representing wholeness and unity',
    svg: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="10" fill="currentColor"/>
        <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" stroke-width="1"/>
        <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" stroke-width="1"/>
        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" stroke-width="1"/>
        <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" stroke-width="1"/>
      </svg>
    `,
  },
  spiralGoldenRatio: {
    name: 'Golden Spiral',
    description: 'Spiral following the golden ratio, found in nature',
    svg: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M 100 100 Q 130 100 130 70 T 100 40 T 70 70 T 70 100 T 100 130 T 130 130 T 130 100" 
              fill="none" stroke="currentColor" stroke-width="1"/>
      </svg>
    `,
  },
};

// Chakra system with colors and associations
export const CHAKRA_SYSTEM = {
  root: {
    name: 'Root Chakra',
    element: 'Earth',
    color: 'oklch(45% 0.15 25)',
    frequency: 174,
    affirmation: 'I am grounded and safe',
    location: 'Base of spine',
  },
  sacral: {
    name: 'Sacral Chakra',
    element: 'Water',
    color: 'oklch(55% 0.20 35)',
    frequency: 417,
    affirmation: 'I am creative and flowing',
    location: 'Lower abdomen',
  },
  solarPlexus: {
    name: 'Solar Plexus Chakra',
    element: 'Fire',
    color: 'oklch(65% 0.25 60)',
    frequency: 432,
    affirmation: 'I am powerful and confident',
    location: 'Upper abdomen',
  },
  heart: {
    name: 'Heart Chakra',
    element: 'Air',
    color: 'oklch(60% 0.28 130)',
    frequency: 528,
    affirmation: 'I am loving and compassionate',
    location: 'Center of chest',
  },
  throat: {
    name: 'Throat Chakra',
    element: 'Sound',
    color: 'oklch(55% 0.25 200)',
    frequency: 639,
    affirmation: 'I speak my truth',
    location: 'Throat',
  },
  thirdEye: {
    name: 'Third Eye Chakra',
    element: 'Light',
    color: 'oklch(50% 0.20 270)',
    frequency: 741,
    affirmation: 'I see clearly',
    location: 'Between eyebrows',
  },
  crown: {
    name: 'Crown Chakra',
    element: 'Thought',
    color: 'oklch(45% 0.15 300)',
    frequency: 963,
    affirmation: 'I am connected to all',
    location: 'Top of head',
  },
};

// Temporal layers for past/present/future visualization
export const TEMPORAL_LAYERS = {
  past: {
    name: 'Past',
    opacity: 0.5,
    blur: 'blur(2px)',
    scale: 0.95,
    description: 'Wisdom and lessons learned',
    color: 'oklch(50% 0.1 280)', // Muted purple
  },
  present: {
    name: 'Present',
    opacity: 1,
    blur: 'blur(0px)',
    scale: 1,
    description: 'Now, where power resides',
    color: 'oklch(65% 0.2 280)', // Bright purple
  },
  future: {
    name: 'Future',
    opacity: 0.7,
    blur: 'blur(1px)',
    scale: 1.05,
    description: 'Possibilities and potential',
    color: 'oklch(55% 0.15 280)', // Medium purple
  },
};

/**
 * Get color for frequency
 */
export function getFrequencyColor(frequency: number): string {
  const freq = Object.values(SOLFEGGIO_FREQUENCIES).find((f) => f.hz === frequency);
  return freq?.color || 'oklch(50% 0.1 280)';
}

/**
 * Get chakra for frequency
 */
export function getChakraForFrequency(frequency: number): string {
  const freq = Object.values(SOLFEGGIO_FREQUENCIES).find((f) => f.hz === frequency);
  return freq?.chakra || 'Unknown';
}

/**
 * Calculate golden ratio proportions
 */
export function calculateGoldenRatioProportion(size: number, position: 'small' | 'large' = 'large'): number {
  if (position === 'large') {
    return size / GOLDEN_RATIO;
  } else {
    return size * GOLDEN_RATIO;
  }
}

/**
 * Generate temporal animation keyframes
 */
export function generateTemporalKeyframes(duration: number = 3000) {
  return `
    @keyframes temporalFlow {
      0% {
        opacity: ${TEMPORAL_LAYERS.past.opacity};
        filter: ${TEMPORAL_LAYERS.past.blur};
        transform: scale(${TEMPORAL_LAYERS.past.scale});
      }
      50% {
        opacity: ${TEMPORAL_LAYERS.present.opacity};
        filter: ${TEMPORAL_LAYERS.present.blur};
        transform: scale(${TEMPORAL_LAYERS.present.scale});
      }
      100% {
        opacity: ${TEMPORAL_LAYERS.future.opacity};
        filter: ${TEMPORAL_LAYERS.future.blur};
        transform: scale(${TEMPORAL_LAYERS.future.scale});
      }
    }
  `;
}

/**
 * Generate mandala SVG with custom colors
 */
export function generateMandala(colors: string[], rings: number = 5): string {
  let svg = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">`;

  // Center circle
  svg += `<circle cx="100" cy="100" r="10" fill="${colors[0]}"/>`;

  // Rings
  for (let i = 1; i <= rings; i++) {
    const radius = 20 * i;
    const color = colors[i % colors.length];
    svg += `<circle cx="100" cy="100" r="${radius}" fill="none" stroke="${color}" stroke-width="2"/>`;

    // Petals
    for (let j = 0; j < 8; j++) {
      const angle = (j / 8) * Math.PI * 2;
      const x = 100 + radius * Math.cos(angle);
      const y = 100 + radius * Math.sin(angle);
      svg += `<circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;
    }
  }

  svg += `</svg>`;
  return svg;
}

/**
 * Get temporal layer styling
 */
export function getTemporalLayerStyle(layer: 'past' | 'present' | 'future') {
  const temporal = TEMPORAL_LAYERS[layer];
  return {
    opacity: temporal.opacity,
    filter: temporal.blur,
    transform: `scale(${temporal.scale})`,
  };
}
