import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useGlobalToast } from '@/contexts/ToastContext';
import {
  VideoGenerationConfig,
  AnimationEffect,
  VideoFormat,
  VideoQuality,
  createKenBurnsAnimation,
  createParticleAnimation,
  createZoomInAnimation,
  createPanAnimation,
  createFadeAnimation,
  createRotateAnimation,
  createMusicAudio,
  getVideoPresets,
  estimateFileSize,
  formatFileSize,
} from '@/lib/videoGeneration';
import { Play, Download, Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';

export function VideoGenerator() {
  const { addToast } = useGlobalToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imageUrl, setImageUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('cinematicDragon');
  const [duration, setDuration] = useState<number>(8);
  const [format, setFormat] = useState<VideoFormat>('mp4');
  const [quality, setQuality] = useState<VideoQuality>('high');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<Array<{ url: string; name: string; createdAt: Date }>>([]);
  
  const [animations, setAnimations] = useState<Array<{ effect: AnimationEffect; duration: number; intensity: number }>>([
    { effect: 'kenBurns', duration: 4, intensity: 0.6 },
    { effect: 'particles', duration: 4, intensity: 0.8 },
  ]);

  const presets = getVideoPresets();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setImageUrl(url);
      setPreviewUrl(url);
      addToast({ title: 'Success', message: 'Image uploaded successfully', type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  const addAnimation = () => {
    setAnimations([
      ...animations,
      { effect: 'fade', duration: 2, intensity: 0.5 },
    ]);
  };

  const removeAnimation = (index: number) => {
    setAnimations(animations.filter((_, i) => i !== index));
  };

  const updateAnimation = (index: number, field: string, value: any) => {
    const updated = [...animations];
    updated[index] = { ...updated[index], [field]: value };
    setAnimations(updated);
  };

  const estimatedSize = estimateFileSize({
    imageUrl,
    duration,
    format,
    quality,
    animations: animations.map(a => ({ ...a, easing: 'easeInOut' })),
  } as VideoGenerationConfig);

  const handleGenerateVideo = async () => {
    if (!imageUrl) {
      addToast({ title: 'Error', message: 'Please upload an image first', type: 'error' });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate video generation (in production, this would call the backend)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const videoName = `video-${Date.now()}.${format}`;
      setGeneratedVideos([
        ...generatedVideos,
        {
          url: imageUrl, // In production, this would be the generated video URL
          name: videoName,
          createdAt: new Date(),
        },
      ]);
      
      addToast({ title: 'Success', message: 'Video generated successfully!', type: 'success' });
    } catch (error) {
      addToast({ title: 'Error', message: 'Failed to generate video', type: 'error' });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getAnimationIcon = (effect: AnimationEffect) => {
    const icons: Record<AnimationEffect, string> = {
      kenBurns: '🎬',
      panLeft: '←',
      panRight: '→',
      zoomIn: '🔍',
      zoomOut: '📉',
      rotate: '🔄',
      particles: '✨',
      fade: '👁️',
      slideIn: '↗️',
      slideOut: '↙️',
    };
    return icons[effect];
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Upload Section */}
        <Card className="lg:col-span-1 p-6">
          <h3 className="text-lg font-semibold mb-4">Image Upload</h3>
          
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <div className="space-y-2">
                <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded" />
                <p className="text-sm text-muted-foreground">Click to change image</p>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="font-medium">Upload Image</p>
                <p className="text-sm text-muted-foreground">Click or drag to upload</p>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </Card>

        {/* Settings Section */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <h3 className="text-lg font-semibold">Video Settings</h3>
          
          {/* Preset Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Preset</label>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(presets).map(([key, preset]) => (
                  <SelectItem key={key} value={key}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {presets[selectedPreset as keyof typeof presets]?.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Duration */}
            <div>
              <label className="text-sm font-medium mb-2 block">Duration: {duration}s</label>
            <input
              type="range"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={2}
              max={30}
              step={1}
              className="w-full"
            />
            </div>

            {/* Format */}
            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <Select value={format} onValueChange={(val) => setFormat(val as VideoFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                  <SelectItem value="gif">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quality</label>
              <Select value={quality} onValueChange={(val) => setQuality(val as VideoQuality)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="4k">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Size Estimate */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Estimated Size:</span> {formatFileSize(estimatedSize * 1024 * 1024)}
            </p>
          </div>
        </Card>
      </div>

      {/* Animation Effects Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Animation Effects</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={addAnimation}
            disabled={isGenerating}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Effect
          </Button>
        </div>

        <div className="space-y-3">
          {animations.map((animation, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <span className="text-2xl">{getAnimationIcon(animation.effect)}</span>
              
              <Select
                value={animation.effect}
                onValueChange={(val) => updateAnimation(index, 'effect', val as AnimationEffect)}
                disabled={isGenerating}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kenBurns">Ken Burns</SelectItem>
                  <SelectItem value="particles">Particles</SelectItem>
                  <SelectItem value="zoomIn">Zoom In</SelectItem>
                  <SelectItem value="panLeft">Pan Left</SelectItem>
                  <SelectItem value="panRight">Pan Right</SelectItem>
                  <SelectItem value="rotate">Rotate</SelectItem>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slideIn">Slide In</SelectItem>
                  <SelectItem value="slideOut">Slide Out</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1">
                <label className="text-xs font-medium mb-1 block">Intensity: {(animation.intensity * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  value={animation.intensity}
                  onChange={(e) => updateAnimation(index, 'intensity', Number(e.target.value))}
                  min={0}
                  max={1}
                  step={0.1}
                  disabled={isGenerating}
                  className="w-full"
                />
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeAnimation(index)}
                disabled={isGenerating}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Generate Button */}
      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={handleGenerateVideo}
          disabled={!imageUrl || isGenerating}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Generate Video
            </>
          )}
        </Button>
      </div>

      {/* Generated Videos Gallery */}
      {generatedVideos.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedVideos.map((video, index) => (
              <div key={index} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  <img src={video.url} alt={video.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{video.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {video.createdAt.toLocaleString()}
                  </p>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
