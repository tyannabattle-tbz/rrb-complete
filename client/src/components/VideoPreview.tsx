import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export interface VideoPreviewProps {
  imageUrl: string;
  duration: number;
  animations: Array<{
    effect: string;
    duration: number;
    intensity: number;
  }>;
  isGenerating?: boolean;
  onPreviewReady?: (canvas: HTMLCanvasElement) => void;
}

export function VideoPreview({
  imageUrl,
  duration,
  animations,
  isGenerating = false,
  onPreviewReady,
}: VideoPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);

  // Load and draw image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set canvas size to match image aspect ratio
      const aspectRatio = img.width / img.height;
      canvas.width = 640;
      canvas.height = Math.round(640 / aspectRatio);

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Apply animation effects
      applyAnimationEffects(ctx, canvas, img, currentTime);

      if (onPreviewReady) {
        onPreviewReady(canvas);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, onPreviewReady]);

  // Apply animation effects to canvas
  const applyAnimationEffects = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    time: number
  ) => {
    const progress = Math.min(time / duration, 1);

    // Save context state
    ctx.save();

    // Apply animations based on effects
    animations.forEach((anim) => {
      const animProgress = Math.min(time / anim.duration, 1);

      switch (anim.effect) {
        case 'kenBurns':
          // Zoom and pan effect
          const scale = 1 + animProgress * 0.3 * anim.intensity;
          const offsetX = (canvas.width * (1 - scale)) / 2;
          const offsetY = (canvas.height * (1 - scale)) / 2;
          ctx.translate(offsetX, offsetY);
          ctx.scale(scale, scale);
          break;

        case 'zoomIn':
          const zoomScale = 1 + animProgress * anim.intensity;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(zoomScale, zoomScale);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
          break;

        case 'panLeft':
          const panOffset = canvas.width * animProgress * anim.intensity;
          ctx.translate(-panOffset, 0);
          break;

        case 'panRight':
          const panOffsetRight = canvas.width * animProgress * anim.intensity;
          ctx.translate(panOffsetRight, 0);
          break;

        case 'fade':
          ctx.globalAlpha = 1 - animProgress * anim.intensity;
          break;

        case 'rotate':
          const rotation = animProgress * Math.PI * 2 * anim.intensity;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(rotation);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
          break;

        case 'particles':
          // Draw particle effects
          drawParticles(ctx, canvas, animProgress, anim.intensity);
          break;
      }
    });

    // Redraw image with transformations
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Restore context state
    ctx.restore();
  };

  // Draw particle effects
  const drawParticles = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    progress: number,
    intensity: number
  ) => {
    const particleCount = Math.floor(50 * intensity);
    ctx.fillStyle = `rgba(255, 215, 0, ${0.5 * (1 - progress)})`;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = progress * 200 * intensity;
      const x = canvas.width / 2 + Math.cos(angle) * distance;
      const y = canvas.height / 2 + Math.sin(angle) * distance;
      const size = 2 + Math.random() * 4;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp;
      }

      const elapsed = (timestamp - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);

      if (elapsed >= duration) {
        setIsPlaying(false);
        setCurrentTime(0);
        startTimeRef.current = 0;
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    setIsPlaying(false);
    startTimeRef.current = 0;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Preview</h3>
        <div className="bg-black rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ maxHeight: '400px' }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-8">
            {currentTime.toFixed(1)}s
          </span>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={handleProgressChange}
            className="flex-1"
            disabled={isGenerating}
          />
          <span className="text-xs text-muted-foreground w-8">
            {duration.toFixed(1)}s
          </span>
        </div>

        {/* Playback controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePlayPause}
            disabled={isGenerating}
            className="flex-1"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMuted(!isMuted)}
            disabled={isGenerating}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Animations:</strong> {animations.length}
          </p>
          <p>
            <strong>Duration:</strong> {duration}s
          </p>
          <p>
            <strong>Effects:</strong> {animations.map((a) => a.effect).join(', ')}
          </p>
        </div>
      </div>
    </Card>
  );
}
