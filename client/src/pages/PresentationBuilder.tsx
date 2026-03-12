import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Plus, Trash2, ChevronLeft, ChevronRight, Layout, Type, Image, FileText,
  Wand2, Download, Play, Pause, Maximize2, Copy, MoveUp, MoveDown,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Square, Circle, Triangle, Palette, Layers, Monitor, Smartphone,
  MessageSquare, Music, Video, Globe, Sparkles, Save, FolderOpen,
  Presentation, Grid3X3, LayoutTemplate, Columns, Rows, PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

// Slide template types
type SlideLayout = 'title' | 'content' | 'two-column' | 'media-left' | 'media-right' | 'blank' | 'quote' | 'comparison';

interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'chart' | 'video' | 'audio';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style: {
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    textAlign?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    opacity?: number;
  };
}

interface Slide {
  id: string;
  layout: SlideLayout;
  backgroundColor: string;
  backgroundImage?: string;
  elements: SlideElement[];
  notes: string;
  transition: string;
}

const THEMES = [
  { name: 'Canryn Gold', bg: '#0A0A0A', accent: '#D4A843', text: '#E8E0D0', secondary: '#1A1A2E' },
  { name: 'Royal Purple', bg: '#1A0A2E', accent: '#8B5CF6', text: '#F0E6FF', secondary: '#2D1B69' },
  { name: 'Ocean Blue', bg: '#0A1628', accent: '#3B82F6', text: '#E0F0FF', secondary: '#1E3A5F' },
  { name: 'Forest Green', bg: '#0A1A0A', accent: '#22C55E', text: '#E0FFE8', secondary: '#1A3A1A' },
  { name: 'Sunset Orange', bg: '#1A0A0A', accent: '#F97316', text: '#FFF0E0', secondary: '#3A1A0A' },
  { name: 'Clean White', bg: '#FFFFFF', accent: '#1A1A2E', text: '#1A1A1A', secondary: '#F5F5F5' },
  { name: 'SQUADD Purple', bg: '#0F0520', accent: '#A855F7', text: '#F5E6FF', secondary: '#1A0A3E' },
  { name: 'HybridCast Red', bg: '#1A0A0A', accent: '#EF4444', text: '#FFE0E0', secondary: '#3A0A0A' },
];

const LAYOUT_TEMPLATES: { layout: SlideLayout; label: string; icon: React.ReactNode }[] = [
  { layout: 'title', label: 'Title Slide', icon: <Monitor className="w-4 h-4" /> },
  { layout: 'content', label: 'Content', icon: <FileText className="w-4 h-4" /> },
  { layout: 'two-column', label: 'Two Column', icon: <Columns className="w-4 h-4" /> },
  { layout: 'media-left', label: 'Media Left', icon: <PanelLeft className="w-4 h-4" /> },
  { layout: 'media-right', label: 'Media Right', icon: <Rows className="w-4 h-4" /> },
  { layout: 'quote', label: 'Quote', icon: <MessageSquare className="w-4 h-4" /> },
  { layout: 'comparison', label: 'Comparison', icon: <Grid3X3 className="w-4 h-4" /> },
  { layout: 'blank', label: 'Blank', icon: <Square className="w-4 h-4" /> },
];

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function createDefaultSlide(layout: SlideLayout, theme: typeof THEMES[0]): Slide {
  const elements: SlideElement[] = [];
  const id = generateId();

  switch (layout) {
    case 'title':
      elements.push({
        id: generateId(), type: 'text', x: 10, y: 30, width: 80, height: 15,
        content: 'Presentation Title', style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: theme.accent }
      });
      elements.push({
        id: generateId(), type: 'text', x: 15, y: 50, width: 70, height: 10,
        content: 'Subtitle or description goes here', style: { fontSize: 24, textAlign: 'center', color: theme.text, opacity: 0.7 }
      });
      elements.push({
        id: generateId(), type: 'text', x: 20, y: 70, width: 60, height: 6,
        content: '© Canryn Production and its subsidiaries', style: { fontSize: 14, textAlign: 'center', color: theme.text, opacity: 0.5 }
      });
      break;
    case 'content':
      elements.push({
        id: generateId(), type: 'text', x: 5, y: 5, width: 90, height: 12,
        content: 'Slide Title', style: { fontSize: 36, fontWeight: 'bold', color: theme.accent }
      });
      elements.push({
        id: generateId(), type: 'text', x: 5, y: 22, width: 90, height: 65,
        content: '• Key point one\n• Key point two\n• Key point three\n• Key point four',
        style: { fontSize: 20, color: theme.text }
      });
      break;
    case 'two-column':
      elements.push({
        id: generateId(), type: 'text', x: 5, y: 5, width: 90, height: 12,
        content: 'Comparison', style: { fontSize: 36, fontWeight: 'bold', color: theme.accent }
      });
      elements.push({
        id: generateId(), type: 'text', x: 5, y: 22, width: 42, height: 65,
        content: 'Left Column\n\n• Point A\n• Point B\n• Point C', style: { fontSize: 18, color: theme.text }
      });
      elements.push({
        id: generateId(), type: 'text', x: 53, y: 22, width: 42, height: 65,
        content: 'Right Column\n\n• Point D\n• Point E\n• Point F', style: { fontSize: 18, color: theme.text }
      });
      break;
    case 'quote':
      elements.push({
        id: generateId(), type: 'text', x: 10, y: 25, width: 80, height: 30,
        content: '"Your inspiring quote goes here"',
        style: { fontSize: 32, fontStyle: 'italic', textAlign: 'center', color: theme.accent }
      });
      elements.push({
        id: generateId(), type: 'text', x: 20, y: 60, width: 60, height: 8,
        content: '— Attribution', style: { fontSize: 18, textAlign: 'center', color: theme.text, opacity: 0.7 }
      });
      break;
    default:
      elements.push({
        id: generateId(), type: 'text', x: 5, y: 5, width: 90, height: 12,
        content: 'Slide Title', style: { fontSize: 36, fontWeight: 'bold', color: theme.accent }
      });
      elements.push({
        id: generateId(), type: 'text', x: 5, y: 22, width: 90, height: 65,
        content: 'Add your content here', style: { fontSize: 20, color: theme.text }
      });
  }

  return { id, layout, backgroundColor: theme.bg, elements, notes: '', transition: 'fade' };
}

export default function PresentationBuilder() {
  const { user } = useAuth();
  const [presentationTitle, setPresentationTitle] = useState('Untitled Presentation');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [isPresenting, setIsPresenting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('slides');
  const [showNotes, setShowNotes] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // AI content generation via LLM
  const generateContent = trpc.presentation?.generateSlideContent?.useMutation?.() ?? null;

  // Initialize with a title slide if empty
  React.useEffect(() => {
    if (slides.length === 0) {
      setSlides([createDefaultSlide('title', activeTheme)]);
    }
  }, []);

  const currentSlide = slides[currentSlideIndex];
  const selectedElement = currentSlide?.elements.find(e => e.id === selectedElementId);

  const addSlide = useCallback((layout: SlideLayout) => {
    const newSlide = createDefaultSlide(layout, activeTheme);
    setSlides(prev => {
      const next = [...prev];
      next.splice(currentSlideIndex + 1, 0, newSlide);
      return next;
    });
    setCurrentSlideIndex(prev => prev + 1);
    toast.success(`Added ${layout} slide`);
  }, [currentSlideIndex, activeTheme]);

  const deleteSlide = useCallback(() => {
    if (slides.length <= 1) {
      toast.error('Cannot delete the last slide');
      return;
    }
    setSlides(prev => prev.filter((_, i) => i !== currentSlideIndex));
    setCurrentSlideIndex(prev => Math.min(prev, slides.length - 2));
    toast.success('Slide deleted');
  }, [currentSlideIndex, slides.length]);

  const duplicateSlide = useCallback(() => {
    const clone = JSON.parse(JSON.stringify(currentSlide));
    clone.id = generateId();
    clone.elements = clone.elements.map((e: SlideElement) => ({ ...e, id: generateId() }));
    setSlides(prev => {
      const next = [...prev];
      next.splice(currentSlideIndex + 1, 0, clone);
      return next;
    });
    setCurrentSlideIndex(prev => prev + 1);
    toast.success('Slide duplicated');
  }, [currentSlide, currentSlideIndex]);

  const moveSlide = useCallback((direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? currentSlideIndex - 1 : currentSlideIndex + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;
    setSlides(prev => {
      const next = [...prev];
      [next[currentSlideIndex], next[newIndex]] = [next[newIndex], next[currentSlideIndex]];
      return next;
    });
    setCurrentSlideIndex(newIndex);
  }, [currentSlideIndex, slides.length]);

  const updateElement = useCallback((elementId: string, updates: Partial<SlideElement>) => {
    setSlides(prev => prev.map((slide, i) => {
      if (i !== currentSlideIndex) return slide;
      return {
        ...slide,
        elements: slide.elements.map(el => el.id === elementId ? { ...el, ...updates } : el)
      };
    }));
  }, [currentSlideIndex]);

  const updateElementStyle = useCallback((elementId: string, styleUpdates: Partial<SlideElement['style']>) => {
    setSlides(prev => prev.map((slide, i) => {
      if (i !== currentSlideIndex) return slide;
      return {
        ...slide,
        elements: slide.elements.map(el =>
          el.id === elementId ? { ...el, style: { ...el.style, ...styleUpdates } } : el
        )
      };
    }));
  }, [currentSlideIndex]);

  const addElement = useCallback((type: SlideElement['type']) => {
    const newElement: SlideElement = {
      id: generateId(), type, x: 10, y: 20, width: 40, height: 20,
      content: type === 'text' ? 'New text element' : type === 'shape' ? '' : `[${type}]`,
      style: { fontSize: 18, color: activeTheme.text, textAlign: 'left' }
    };
    setSlides(prev => prev.map((slide, i) => {
      if (i !== currentSlideIndex) return slide;
      return { ...slide, elements: [...slide.elements, newElement] };
    }));
    setSelectedElementId(newElement.id);
  }, [currentSlideIndex, activeTheme]);

  const deleteElement = useCallback(() => {
    if (!selectedElementId) return;
    setSlides(prev => prev.map((slide, i) => {
      if (i !== currentSlideIndex) return slide;
      return { ...slide, elements: slide.elements.filter(el => el.id !== selectedElementId) };
    }));
    setSelectedElementId(null);
  }, [selectedElementId, currentSlideIndex]);

  const handleAIGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) {
      toast.error('Enter a prompt for AI generation');
      return;
    }
    setIsGenerating(true);
    try {
      // Use the ecosystem's LLM integration
      if (generateContent) {
        const result = await generateContent.mutateAsync({ prompt: aiPrompt, slideCount: 5 });
        if (result?.slides) {
          const aiSlides = result.slides.map((s: any) => createDefaultSlide(s.layout || 'content', activeTheme));
          setSlides(prev => [...prev, ...aiSlides]);
          toast.success(`Generated ${result.slides.length} slides with AI`);
        }
      } else {
        // Fallback: generate slides locally based on prompt
        const topics = aiPrompt.split(/[,;.]/).filter(t => t.trim());
        const newSlides: Slide[] = [
          createDefaultSlide('title', activeTheme),
          ...topics.slice(0, 8).map(() => createDefaultSlide('content', activeTheme)),
        ];
        // Update title slide
        if (newSlides[0]?.elements[0]) {
          newSlides[0].elements[0].content = aiPrompt.substring(0, 60);
        }
        topics.forEach((topic, i) => {
          if (newSlides[i + 1]?.elements[0]) {
            newSlides[i + 1].elements[0].content = topic.trim();
          }
        });
        setSlides(prev => [...prev, ...newSlides]);
        toast.success(`Generated ${newSlides.length} slides from your prompt`);
      }
    } catch (err) {
      toast.error('AI generation failed. Try again.');
    } finally {
      setIsGenerating(false);
      setAiPrompt('');
    }
  }, [aiPrompt, activeTheme, generateContent]);

  const applyTheme = useCallback((theme: typeof THEMES[0]) => {
    setActiveTheme(theme);
    setSlides(prev => prev.map(slide => ({
      ...slide,
      backgroundColor: theme.bg,
      elements: slide.elements.map(el => ({
        ...el,
        style: {
          ...el.style,
          color: el.style.fontSize && el.style.fontSize >= 30 ? theme.accent : theme.text,
        }
      }))
    })));
    toast.success(`Applied "${theme.name}" theme`);
  }, []);

  const exportPresentation = useCallback(() => {
    // Generate HTML export
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${presentationTitle}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #000; }
  .slide { width: 100vw; height: 100vh; position: relative; display: flex; align-items: center; justify-content: center; }
  .slide-content { width: 960px; height: 540px; position: relative; overflow: hidden; }
  .element { position: absolute; white-space: pre-wrap; }
</style></head><body>
${slides.map((slide, i) => `
<div class="slide" style="background:${slide.backgroundColor}">
  <div class="slide-content">
    ${slide.elements.map(el => `
    <div class="element" style="left:${el.x}%;top:${el.y}%;width:${el.width}%;height:${el.height}%;
      font-size:${el.style.fontSize || 16}px;font-weight:${el.style.fontWeight || 'normal'};
      color:${el.style.color || '#fff'};text-align:${el.style.textAlign || 'left'};
      font-style:${el.style.fontStyle || 'normal'};">${el.content}</div>`).join('')}
  </div>
</div>`).join('\n')}
<script>
let current = 0;
const slides = document.querySelectorAll('.slide');
slides.forEach((s, i) => { if (i > 0) s.style.display = 'none'; });
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    slides[current].style.display = 'none';
    current = Math.min(current + 1, slides.length - 1);
    slides[current].style.display = 'flex';
  } else if (e.key === 'ArrowLeft') {
    slides[current].style.display = 'none';
    current = Math.max(current - 1, 0);
    slides[current].style.display = 'flex';
  } else if (e.key === 'Escape') {
    window.close();
  }
});
</script></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentationTitle.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Presentation exported as HTML');
  }, [slides, presentationTitle]);

  const startPresentation = useCallback(() => {
    setIsPresenting(true);
    setCurrentSlideIndex(0);
    document.documentElement.requestFullscreen?.();
  }, []);

  const stopPresentation = useCallback(() => {
    setIsPresenting(false);
    document.exitFullscreen?.();
  }, []);

  // Presentation mode
  if (isPresenting && currentSlide) {
    return (
      <div
        className="fixed inset-0 z-[9999] cursor-none"
        style={{ backgroundColor: currentSlide.backgroundColor }}
        onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1))}
        onContextMenu={(e) => { e.preventDefault(); setCurrentSlideIndex(prev => Math.max(prev - 1, 0)); }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') stopPresentation();
          if (e.key === 'ArrowRight' || e.key === ' ') setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
          if (e.key === 'ArrowLeft') setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
        }}
        tabIndex={0}
        autoFocus
      >
        <div className="w-full h-full relative">
          {currentSlide.elements.map(el => (
            <div
              key={el.id}
              className="absolute whitespace-pre-wrap"
              style={{
                left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`,
                fontSize: `${(el.style.fontSize || 16) * 1.5}px`,
                fontWeight: el.style.fontWeight || 'normal',
                fontStyle: el.style.fontStyle || 'normal',
                textDecoration: el.style.textDecoration || 'none',
                textAlign: (el.style.textAlign as any) || 'left',
                color: el.style.color || '#fff',
                opacity: el.style.opacity ?? 1,
              }}
            >
              {el.content}
            </div>
          ))}
        </div>
        {/* Slide counter */}
        <div className="absolute bottom-4 right-4 text-white/30 text-sm">
          {currentSlideIndex + 1} / {slides.length} • Press ESC to exit
        </div>
        {showNotes && currentSlide.notes && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white/70 p-4 text-sm">
            <strong>Speaker Notes:</strong> {currentSlide.notes}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E0D0] flex flex-col">
      {/* Top Toolbar */}
      <div className="border-b border-[#D4A843]/20 bg-[#0A0A0A]/95 backdrop-blur px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Presentation className="w-6 h-6 text-[#D4A843]" />
            <Input
              value={presentationTitle}
              onChange={(e) => setPresentationTitle(e.target.value)}
              className="bg-transparent border-none text-lg font-bold text-[#D4A843] w-64 focus:ring-0 px-0"
            />
            <Badge className="bg-[#D4A843]/10 text-[#D4A843] text-xs">{slides.length} slides</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={exportPresentation} className="border-[#D4A843]/30 text-[#D4A843]">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={startPresentation} className="bg-[#D4A843] hover:bg-[#B8922E] text-black font-bold">
              <Play className="w-4 h-4 mr-1" /> Present
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Slide Thumbnails */}
        <div className="w-48 border-r border-[#D4A843]/10 bg-[#050505] overflow-y-auto p-2 flex-shrink-0">
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentSlideIndex ? 'border-[#D4A843] shadow-lg shadow-[#D4A843]/20' : 'border-transparent hover:border-[#D4A843]/30'
                }`}
                onClick={() => { setCurrentSlideIndex(index); setSelectedElementId(null); }}
              >
                <div className="aspect-video p-2 text-[6px]" style={{ backgroundColor: slide.backgroundColor }}>
                  {slide.elements.slice(0, 3).map(el => (
                    <div key={el.id} className="truncate" style={{ color: el.style.color, fontSize: '6px', fontWeight: el.style.fontWeight }}>
                      {el.content.substring(0, 30)}
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[10px] text-[#E8E0D0]/60 py-0.5">
                  {index + 1}
                </div>
              </div>
            ))}
            {/* Add slide button */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full aspect-video rounded-lg border-2 border-dashed border-[#D4A843]/20 hover:border-[#D4A843]/50 flex items-center justify-center transition-all">
                  <Plus className="w-6 h-6 text-[#D4A843]/50" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#111] border-[#D4A843]/20 text-[#E8E0D0]">
                <DialogHeader>
                  <DialogTitle className="text-[#D4A843]">Choose Slide Layout</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {LAYOUT_TEMPLATES.map(t => (
                    <button
                      key={t.layout}
                      onClick={() => addSlide(t.layout)}
                      className="p-3 rounded-lg border border-[#D4A843]/20 hover:border-[#D4A843] hover:bg-[#D4A843]/10 transition-all text-center"
                    >
                      <div className="flex justify-center mb-2 text-[#D4A843]">{t.icon}</div>
                      <span className="text-xs">{t.label}</span>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Center - Slide Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas area */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-[#080808]">
            {currentSlide && (
              <div
                ref={canvasRef}
                className="relative shadow-2xl rounded-lg overflow-hidden"
                style={{
                  width: '800px', height: '450px',
                  backgroundColor: currentSlide.backgroundColor,
                  backgroundImage: currentSlide.backgroundImage ? `url(${currentSlide.backgroundImage})` : undefined,
                  backgroundSize: 'cover',
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSelectedElementId(null);
                }}
              >
                {currentSlide.elements.map(el => (
                  <div
                    key={el.id}
                    className={`absolute cursor-pointer whitespace-pre-wrap transition-shadow ${
                      selectedElementId === el.id ? 'ring-2 ring-[#D4A843] ring-offset-1 ring-offset-transparent' : 'hover:ring-1 hover:ring-[#D4A843]/30'
                    }`}
                    style={{
                      left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`,
                      fontSize: `${el.style.fontSize || 16}px`,
                      fontWeight: el.style.fontWeight || 'normal',
                      fontStyle: el.style.fontStyle || 'normal',
                      textDecoration: el.style.textDecoration || 'none',
                      textAlign: (el.style.textAlign as any) || 'left',
                      color: el.style.color || '#fff',
                      backgroundColor: el.style.backgroundColor || 'transparent',
                      borderRadius: `${el.style.borderRadius || 0}px`,
                      opacity: el.style.opacity ?? 1,
                      padding: '4px',
                    }}
                    onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                  >
                    {el.content}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom toolbar - slide actions */}
          <div className="border-t border-[#D4A843]/10 bg-[#0A0A0A] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))} disabled={currentSlideIndex === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-[#E8E0D0]/60">{currentSlideIndex + 1} / {slides.length}</span>
              <Button size="sm" variant="ghost" onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))} disabled={currentSlideIndex === slides.length - 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => moveSlide('up')} title="Move slide up"><MoveUp className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => moveSlide('down')} title="Move slide down"><MoveDown className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={duplicateSlide} title="Duplicate slide"><Copy className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={deleteSlide} title="Delete slide" className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Properties & Tools */}
        <div className="w-72 border-l border-[#D4A843]/10 bg-[#050505] overflow-y-auto flex-shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-[#111] rounded-none border-b border-[#D4A843]/10">
              <TabsTrigger value="slides" className="flex-1 text-xs">Slides</TabsTrigger>
              <TabsTrigger value="elements" className="flex-1 text-xs">Elements</TabsTrigger>
              <TabsTrigger value="ai" className="flex-1 text-xs">AI</TabsTrigger>
              <TabsTrigger value="theme" className="flex-1 text-xs">Theme</TabsTrigger>
            </TabsList>

            {/* Elements Tab - Add & Edit */}
            <TabsContent value="elements" className="p-3 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#D4A843] mb-2">Add Element</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'text' as const, icon: <Type className="w-4 h-4" />, label: 'Text' },
                    { type: 'image' as const, icon: <Image className="w-4 h-4" />, label: 'Image' },
                    { type: 'shape' as const, icon: <Square className="w-4 h-4" />, label: 'Shape' },
                    { type: 'video' as const, icon: <Video className="w-4 h-4" />, label: 'Video' },
                    { type: 'audio' as const, icon: <Music className="w-4 h-4" />, label: 'Audio' },
                    { type: 'chart' as const, icon: <Grid3X3 className="w-4 h-4" />, label: 'Chart' },
                  ].map(item => (
                    <button
                      key={item.type}
                      onClick={() => addElement(item.type)}
                      className="p-2 rounded border border-[#D4A843]/20 hover:border-[#D4A843] hover:bg-[#D4A843]/10 transition-all text-center"
                    >
                      <div className="flex justify-center mb-1 text-[#D4A843]">{item.icon}</div>
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected element properties */}
              {selectedElement && (
                <div className="space-y-3 pt-3 border-t border-[#D4A843]/10">
                  <h4 className="text-xs font-bold text-[#D4A843]">Edit Element</h4>
                  <Textarea
                    value={selectedElement.content}
                    onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                    className="bg-[#111] border-[#D4A843]/20 text-sm min-h-[80px]"
                    placeholder="Element content..."
                  />
                  <div className="flex gap-1">
                    <Button size="sm" variant={selectedElement.style.fontWeight === 'bold' ? 'default' : 'ghost'}
                      onClick={() => updateElementStyle(selectedElement.id, { fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold' })}>
                      <Bold className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant={selectedElement.style.fontStyle === 'italic' ? 'default' : 'ghost'}
                      onClick={() => updateElementStyle(selectedElement.id, { fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic' })}>
                      <Italic className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant={selectedElement.style.textDecoration === 'underline' ? 'default' : 'ghost'}
                      onClick={() => updateElementStyle(selectedElement.id, { textDecoration: selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline' })}>
                      <Underline className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant={selectedElement.style.textAlign === 'left' ? 'default' : 'ghost'}
                      onClick={() => updateElementStyle(selectedElement.id, { textAlign: 'left' })}>
                      <AlignLeft className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant={selectedElement.style.textAlign === 'center' ? 'default' : 'ghost'}
                      onClick={() => updateElementStyle(selectedElement.id, { textAlign: 'center' })}>
                      <AlignCenter className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant={selectedElement.style.textAlign === 'right' ? 'default' : 'ghost'}
                      onClick={() => updateElementStyle(selectedElement.id, { textAlign: 'right' })}>
                      <AlignRight className="w-3 h-3" />
                    </Button>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#E8E0D0]/50">Font Size: {selectedElement.style.fontSize}px</label>
                    <Slider
                      value={[selectedElement.style.fontSize || 16]}
                      onValueChange={([v]) => updateElementStyle(selectedElement.id, { fontSize: v })}
                      min={8} max={72} step={1}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <label className="text-[10px] text-[#E8E0D0]/50">Color</label>
                      <input type="color" value={selectedElement.style.color || '#ffffff'}
                        onChange={(e) => updateElementStyle(selectedElement.id, { color: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#E8E0D0]/50">Background</label>
                      <input type="color" value={selectedElement.style.backgroundColor || '#000000'}
                        onChange={(e) => updateElementStyle(selectedElement.id, { backgroundColor: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer" />
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={deleteElement} className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 className="w-3 h-3 mr-1" /> Delete Element
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Slides Tab - Notes */}
            <TabsContent value="slides" className="p-3 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#D4A843] mb-2">Slide Layout</h4>
                <div className="grid grid-cols-4 gap-1">
                  {LAYOUT_TEMPLATES.map(t => (
                    <button
                      key={t.layout}
                      onClick={() => addSlide(t.layout)}
                      className="p-1.5 rounded border border-[#D4A843]/10 hover:border-[#D4A843]/50 text-center transition-all"
                    >
                      <div className="flex justify-center text-[#D4A843]/60">{t.icon}</div>
                      <span className="text-[8px] text-[#E8E0D0]/40">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#D4A843] mb-2">Speaker Notes</h4>
                <Textarea
                  value={currentSlide?.notes || ''}
                  onChange={(e) => {
                    setSlides(prev => prev.map((s, i) => i === currentSlideIndex ? { ...s, notes: e.target.value } : s));
                  }}
                  placeholder="Add speaker notes for this slide..."
                  className="bg-[#111] border-[#D4A843]/20 text-sm min-h-[120px]"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#D4A843] mb-2">Slide Background</h4>
                <input
                  type="color"
                  value={currentSlide?.backgroundColor || '#0A0A0A'}
                  onChange={(e) => {
                    setSlides(prev => prev.map((s, i) => i === currentSlideIndex ? { ...s, backgroundColor: e.target.value } : s));
                  }}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </TabsContent>

            {/* AI Tab */}
            <TabsContent value="ai" className="p-3 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#D4A843] mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Slide Generator
                </h4>
                <p className="text-[10px] text-[#E8E0D0]/50 mb-2">
                  Describe your presentation topic and QUMUS will generate slides for you.
                </p>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Create a 5-slide presentation about SQUADD Coalition's mission at CSW70..."
                  className="bg-[#111] border-[#D4A843]/20 text-sm min-h-[100px]"
                />
                <Button
                  size="sm"
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full mt-2 bg-gradient-to-r from-purple-600 to-[#D4A843] text-white font-bold"
                >
                  {isGenerating ? (
                    <><span className="animate-spin mr-1">⚡</span> Generating...</>
                  ) : (
                    <><Wand2 className="w-4 h-4 mr-1" /> Generate Slides</>
                  )}
                </Button>
              </div>
              <div className="border-t border-[#D4A843]/10 pt-3">
                <h4 className="text-xs font-bold text-[#D4A843] mb-2">Quick Templates</h4>
                <div className="space-y-1">
                  {[
                    'SQUADD Coalition Overview',
                    'Canryn Production Ecosystem',
                    'HybridCast Emergency System',
                    'Sweet Miracles Grant Report',
                    'RRB Radio Network Stats',
                  ].map(template => (
                    <button
                      key={template}
                      onClick={() => setAiPrompt(`Create a professional presentation about ${template}`)}
                      className="w-full text-left text-xs p-2 rounded hover:bg-[#D4A843]/10 text-[#E8E0D0]/70 hover:text-[#D4A843] transition-all"
                    >
                      <LayoutTemplate className="w-3 h-3 inline mr-1" /> {template}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Theme Tab */}
            <TabsContent value="theme" className="p-3 space-y-4">
              <h4 className="text-xs font-bold text-[#D4A843] mb-2">Presentation Theme</h4>
              <div className="space-y-2">
                {THEMES.map(theme => (
                  <button
                    key={theme.name}
                    onClick={() => applyTheme(theme)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all ${
                      activeTheme.name === theme.name ? 'border-[#D4A843] bg-[#D4A843]/10' : 'border-[#D4A843]/10 hover:border-[#D4A843]/30'
                    }`}
                  >
                    <div className="flex gap-1">
                      <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: theme.bg }} />
                      <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: theme.accent }} />
                      <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: theme.text }} />
                    </div>
                    <span className="text-xs">{theme.name}</span>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#D4A843]/10 bg-[#050505] px-4 py-1 text-center">
        <span className="text-[10px] text-[#E8E0D0]/30">© Canryn Production and its subsidiaries. Presentation Builder powered by QUMUS.</span>
      </div>
    </div>
  );
}
