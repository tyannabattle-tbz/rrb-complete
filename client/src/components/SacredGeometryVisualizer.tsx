import React, { useEffect, useRef } from 'react';
import {
  SOLFEGGIO_FREQUENCIES,
  CHAKRA_SYSTEM,
  TEMPORAL_LAYERS,
  generateMandala,
  getFrequencyColor,
} from '@/utils/sacredGeometry';

interface SacredGeometryVisualizerProps {
  type?: 'mandala' | 'chakra' | 'frequency' | 'temporal';
  frequency?: number;
  chakra?: keyof typeof CHAKRA_SYSTEM;
  size?: number;
  interactive?: boolean;
  className?: string;
}

/**
 * Sacred Geometry Visualizer Component
 * Displays sacred geometry patterns with healing frequency colors
 */
export const SacredGeometryVisualizer: React.FC<SacredGeometryVisualizerProps> = ({
  type = 'mandala',
  frequency,
  chakra,
  size = 200,
  interactive = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = React.useState(0);

  // Auto-rotate for animation
  useEffect(() => {
    if (!interactive) return;

    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [interactive]);

  // Draw mandala on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Apply rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    if (type === 'mandala') {
      drawMandala(ctx, centerX, centerY, frequency);
    } else if (type === 'chakra') {
      drawChakra(ctx, centerX, centerY, chakra);
    } else if (type === 'frequency') {
      drawFrequency(ctx, centerX, centerY, frequency);
    } else if (type === 'temporal') {
      drawTemporal(ctx, centerX, centerY);
    }

    ctx.restore();
  }, [type, frequency, chakra, size, rotation]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{
        filter: interactive ? 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))' : undefined,
      }}
    />
  );
};

/**
 * Draw mandala pattern
 */
function drawMandala(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, frequency?: number) {
  const color = frequency ? getFrequencyColor(frequency) : 'oklch(60% 0.2 280)';
  const rgbColor = oklchToRgb(color);

  // Draw concentric circles
  for (let i = 1; i <= 5; i++) {
    const radius = (centerX / 5) * i;

    ctx.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${0.3 + i * 0.1})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw petals
    for (let j = 0; j < 8; j++) {
      const angle = (j / 8) * Math.PI * 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${0.5 + i * 0.1})`;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Center circle
  ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 1)`;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw chakra visualization
 */
function drawChakra(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  chakra?: keyof typeof CHAKRA_SYSTEM
) {
  const chakraData = chakra ? CHAKRA_SYSTEM[chakra] : CHAKRA_SYSTEM.heart;
  const rgbColor = oklchToRgb(chakraData.color);

  // Draw chakra symbol (circle with petals)
  const petalCount = 6;
  const petalRadius = centerX / 2;

  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const x = centerX + petalRadius * Math.cos(angle);
    const y = centerY + petalRadius * Math.sin(angle);

    // Draw petal
    ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.6)`;
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 25, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw center circle
  ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 1)`;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
  ctx.fill();

  // Draw outer ring
  ctx.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.8)`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, petalRadius + 20, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * Draw frequency visualization
 */
function drawFrequency(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, frequency?: number) {
  if (!frequency) return;

  const freq = Object.values(SOLFEGGIO_FREQUENCIES).find((f) => f.hz === frequency);
  if (!freq) return;

  const rgbColor = oklchToRgb(freq.color);
  const waveCount = Math.floor(frequency / 100);

  // Draw frequency waves
  for (let wave = 0; wave < waveCount; wave++) {
    const radius = (centerX / waveCount) * (wave + 1);

    ctx.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${0.3 + (wave / waveCount) * 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw center point
  ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 1)`;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw temporal visualization
 */
function drawTemporal(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
  const layers = ['past', 'present', 'future'] as const;
  const radius = centerX / 2;

  layers.forEach((layer, index) => {
    const temporal = TEMPORAL_LAYERS[layer];
    const rgbColor = oklchToRgb(temporal.color);
    const angle = (index / 3) * Math.PI * 2 - Math.PI / 2;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // Draw layer circle
    ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${temporal.opacity})`;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw connecting line
    ctx.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.5)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  // Draw center
  ctx.fillStyle = 'rgba(200, 150, 255, 1)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Convert OKLCH color to RGB
 */
function oklchToRgb(oklch: string): { r: number; g: number; b: number } {
  // Simple approximation - in production, use proper color library
  const match = oklch.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) return { r: 150, g: 100, b: 200 };

  const l = parseFloat(match[1]) / 100;
  const c = parseFloat(match[2]);
  const h = parseFloat(match[3]);

  // Simplified OKLCH to RGB conversion
  const hRad = (h * Math.PI) / 180;
  const r = Math.round(Math.max(0, Math.min(255, l * 255 + c * 100 * Math.cos(hRad))));
  const g = Math.round(Math.max(0, Math.min(255, l * 255 + c * 100 * Math.sin(hRad))));
  const b = Math.round(Math.max(0, Math.min(255, l * 255 - c * 100)));

  return { r, g, b };
}

/**
 * Temporal Bridge Component
 * Shows past, present, future as interconnected layers
 */
export const TemporalBridge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-8 ${className}`}>
      {/* Past */}
      <div className="text-center opacity-50">
        <SacredGeometryVisualizer type="mandala" size={100} />
        <p className="text-xs text-slate-400 mt-2">Past</p>
        <p className="text-xs text-slate-500">Wisdom</p>
      </div>

      {/* Bridge */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-1 h-16 bg-gradient-to-b from-slate-600 via-purple-500 to-slate-600" />
        <div className="text-2xl">🌉</div>
        <div className="w-1 h-16 bg-gradient-to-b from-slate-600 via-purple-500 to-slate-600" />
      </div>

      {/* Present */}
      <div className="text-center">
        <SacredGeometryVisualizer type="mandala" size={120} interactive />
        <p className="text-xs text-white mt-2 font-semibold">Present</p>
        <p className="text-xs text-slate-300">Now</p>
      </div>

      {/* Bridge */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-1 h-16 bg-gradient-to-b from-slate-600 via-blue-500 to-slate-600" />
        <div className="text-2xl">🌉</div>
        <div className="w-1 h-16 bg-gradient-to-b from-slate-600 via-blue-500 to-slate-600" />
      </div>

      {/* Future */}
      <div className="text-center opacity-70">
        <SacredGeometryVisualizer type="mandala" size={110} />
        <p className="text-xs text-slate-300 mt-2">Future</p>
        <p className="text-xs text-slate-500">Potential</p>
      </div>
    </div>
  );
};

export default SacredGeometryVisualizer;
