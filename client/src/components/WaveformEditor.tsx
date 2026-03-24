import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, Copy, Zap, Volume2, Music, Undo2, Redo2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditAction {
  type: 'cut' | 'copy' | 'paste' | 'effect' | 'trim';
  timestamp: number;
  description: string;
}

export function WaveformEditor() {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [panPosition, setPanPosition] = useState(0);
  const [selectedStart, setSelectedStart] = useState(0);
  const [selectedEnd, setSelectedEnd] = useState(3000);
  const [editHistory, setEditHistory] = useState<EditAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeEffects, setActiveEffects] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addEditAction = (action: EditAction) => {
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(action);
    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      toast.success('Undo');
    }
  };

  const redo = () => {
    if (historyIndex < editHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      toast.success('Redo');
    }
  };

  const handleCut = () => {
    addEditAction({
      type: 'cut',
      timestamp: Date.now(),
      description: `Cut ${selectedEnd - selectedStart}ms`,
    });
    toast.success(`Cut ${selectedEnd - selectedStart}ms of audio`);
  };

  const handleCopy = () => {
    addEditAction({
      type: 'copy',
      timestamp: Date.now(),
      description: `Copy ${selectedEnd - selectedStart}ms`,
    });
    toast.success(`Copied ${selectedEnd - selectedStart}ms of audio`);
  };

  const handlePaste = () => {
    addEditAction({
      type: 'paste',
      timestamp: Date.now(),
      description: 'Paste audio',
    });
    toast.success('Audio pasted');
  };

  const applyEffect = (effectName: string) => {
    if (activeEffects.includes(effectName)) {
      setActiveEffects(activeEffects.filter((e) => e !== effectName));
      toast.success(`${effectName} removed`);
    } else {
      setActiveEffects([...activeEffects, effectName]);
      addEditAction({
        type: 'effect',
        timestamp: Date.now(),
        description: `Applied ${effectName}`,
      });
      toast.success(`${effectName} applied`);
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    // Draw waveform
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < width; i++) {
      const y = height / 2 + Math.sin((i + panPosition) / 50) * (height / 4);
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();

    // Draw selection
    if (selectedStart !== selectedEnd) {
      const startX = (selectedStart / 3000) * width;
      const endX = (selectedEnd / 3000) * width;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(startX, 0, endX - startX, height);
    }

    // Draw center line
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  React.useEffect(() => {
    drawWaveform();
  }, [zoomLevel, panPosition, selectedStart, selectedEnd]);

  return (
    <div className="space-y-6">
      {/* Waveform Display */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Music className="w-4 h-4 text-blue-400" />
            Waveform Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="w-full bg-slate-900 rounded border border-slate-700 cursor-crosshair"
            onClick={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                const x = e.clientX - rect.left;
                const time = (x / rect.width) * 3000;
                setSelectedStart(Math.min(time, selectedEnd));
              }
            }}
          />

          {/* Zoom and Pan Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Zoom Level</label>
              <input
                type="range"
                min="50"
                max="200"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-slate-400 text-center mt-1">{zoomLevel}%</div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Pan Position</label>
              <input
                type="range"
                min="0"
                max="100"
                value={panPosition}
                onChange={(e) => setPanPosition(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-slate-400 text-center mt-1">{panPosition}%</div>
            </div>
          </div>

          {/* Selection Display */}
          <div className="bg-slate-900 rounded p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-2">Selection</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Start:</span>
                <span className="text-slate-300 ml-1">{selectedStart.toFixed(0)}ms</span>
              </div>
              <div>
                <span className="text-slate-500">End:</span>
                <span className="text-slate-300 ml-1">{selectedEnd.toFixed(0)}ms</span>
              </div>
              <div>
                <span className="text-slate-500">Duration:</span>
                <span className="text-slate-300 ml-1">{(selectedEnd - selectedStart).toFixed(0)}ms</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Tools */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Edit Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button size="sm" variant="outline" onClick={handleCut} className="text-xs">
              <Scissors className="w-3 h-3 mr-1" />
              Cut
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs">
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button size="sm" variant="outline" onClick={handlePaste} className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Paste
            </Button>
            <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex <= 0} className="text-xs">
              <Undo2 className="w-3 h-3 mr-1" />
              Undo
            </Button>
            <Button size="sm" variant="outline" onClick={redo} disabled={historyIndex >= editHistory.length - 1} className="text-xs">
              <Redo2 className="w-3 h-3 mr-1" />
              Redo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Effects */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Audio Effects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* EQ */}
            <div className="bg-slate-900 rounded p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white font-medium">3-Band EQ</span>
                <Button
                  size="sm"
                  variant={activeEffects.includes('EQ') ? 'default' : 'outline'}
                  onClick={() => applyEffect('EQ')}
                  className="text-xs"
                >
                  {activeEffects.includes('EQ') ? 'ON' : 'OFF'}
                </Button>
              </div>
              {activeEffects.includes('EQ') && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400">Low</label>
                    <input type="range" min="-12" max="12" defaultValue="0" className="w-full" />
                  </div>
                  <div>
                    <label className="text-slate-400">Mid</label>
                    <input type="range" min="-12" max="12" defaultValue="0" className="w-full" />
                  </div>
                  <div>
                    <label className="text-slate-400">High</label>
                    <input type="range" min="-12" max="12" defaultValue="0" className="w-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Compression */}
            <div className="bg-slate-900 rounded p-3 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white font-medium">Compression</span>
                <Button
                  size="sm"
                  variant={activeEffects.includes('Compression') ? 'default' : 'outline'}
                  onClick={() => applyEffect('Compression')}
                  className="text-xs"
                >
                  {activeEffects.includes('Compression') ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>

            {/* Reverb */}
            <div className="bg-slate-900 rounded p-3 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white font-medium">Reverb</span>
                <Button
                  size="sm"
                  variant={activeEffects.includes('Reverb') ? 'default' : 'outline'}
                  onClick={() => applyEffect('Reverb')}
                  className="text-xs"
                >
                  {activeEffects.includes('Reverb') ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>

            {/* Time Stretch */}
            <div className="bg-slate-900 rounded p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white font-medium">Time Stretch</span>
                <Button
                  size="sm"
                  variant={activeEffects.includes('TimeStretch') ? 'default' : 'outline'}
                  onClick={() => applyEffect('TimeStretch')}
                  className="text-xs"
                >
                  {activeEffects.includes('TimeStretch') ? 'ON' : 'OFF'}
                </Button>
              </div>
              {activeEffects.includes('TimeStretch') && (
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Tempo: 100%</label>
                  <input type="range" min="50" max="150" defaultValue="100" className="w-full" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit History */}
      {editHistory.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Edit History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {editHistory.map((action, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-2 rounded ${
                    idx === historyIndex ? 'bg-blue-900 text-blue-200' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {action.description}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
