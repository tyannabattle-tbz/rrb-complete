import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface Location {
  lat: number;
  lng: number;
  name: string;
  type: 'user' | 'target' | 'broadcast';
}

interface FlatWorldMapProps {
  locations?: Location[];
  onLocationClick?: (location: Location) => void;
}

export default function FlatWorldMap({ locations = [], onLocationClick }: FlatWorldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(2);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Convert lat/lng to canvas coordinates
  const latLngToCanvas = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng + 180) / 360) * width * zoom + panX;
    const y = ((90 - lat) / 180) * height * zoom + panY;
    return { x, y };
  };

  // Draw the map
  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1a1f3a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#2d3561';
    ctx.lineWidth = 1;

    // Vertical lines (longitude)
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = ((lng + 180) / 360) * width * zoom + panX;
      if (x >= 0 && x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }

    // Horizontal lines (latitude)
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = ((90 - lat) / 180) * height * zoom + panY;
      if (y >= 0 && y <= height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw continents (simplified)
    drawContinents(ctx, width, height);

    // Draw locations
    locations.forEach((location) => {
      const { x, y } = latLngToCanvas(location.lat, location.lng, width, height);

      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        // Draw marker
        const isSelected = selectedLocation === location;
        const color =
          location.type === 'user'
            ? '#00ff88'
            : location.type === 'target'
              ? '#ff0055'
              : '#00ccff';

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 12 : 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label
        if (isSelected) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(location.name, x, y - 20);
        }
      }
    });

    // Draw coordinates info
    ctx.fillStyle = '#00ff88';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Zoom: ${zoom}x | Pan: (${panX.toFixed(0)}, ${panY.toFixed(0)})`, 10, 20);
  };

  // Draw simplified continents
  const drawContinents = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#1f4d3d';
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;

    // North America
    const naCoords = [
      { lat: 50, lng: -100 },
      { lat: 50, lng: -80 },
      { lat: 25, lng: -80 },
      { lat: 25, lng: -100 },
    ];
    drawPolygon(ctx, naCoords, width, height);

    // South America
    const saCoords = [
      { lat: 15, lng: -60 },
      { lat: 15, lng: -35 },
      { lat: -56, lng: -35 },
      { lat: -56, lng: -60 },
    ];
    drawPolygon(ctx, saCoords, width, height);

    // Europe
    const euCoords = [
      { lat: 70, lng: -10 },
      { lat: 70, lng: 40 },
      { lat: 35, lng: 40 },
      { lat: 35, lng: -10 },
    ];
    drawPolygon(ctx, euCoords, width, height);

    // Africa
    const afCoords = [
      { lat: 37, lng: -17 },
      { lat: 37, lng: 52 },
      { lat: -35, lng: 52 },
      { lat: -35, lng: -17 },
    ];
    drawPolygon(ctx, afCoords, width, height);

    // Asia
    const asCoords = [
      { lat: 75, lng: 40 },
      { lat: 75, lng: 180 },
      { lat: 10, lng: 180 },
      { lat: 10, lng: 40 },
    ];
    drawPolygon(ctx, asCoords, width, height);

    // Australia
    const auCoords = [
      { lat: -10, lng: 113 },
      { lat: -10, lng: 154 },
      { lat: -44, lng: 154 },
      { lat: -44, lng: 113 },
    ];
    drawPolygon(ctx, auCoords, width, height);
  };

  const drawPolygon = (
    ctx: CanvasRenderingContext2D,
    coords: { lat: number; lng: number }[],
    width: number,
    height: number
  ) => {
    ctx.beginPath();
    coords.forEach((coord, i) => {
      const x = ((coord.lng + 180) / 360) * width * zoom + panX;
      const y = ((90 - coord.lat) / 180) * height * zoom + panY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Handle zoom
  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? Math.min(zoom + 0.5, 5) : Math.max(zoom - 0.5, 1);
    setZoom(newZoom);
    toast.success(`Zoom: ${newZoom}x`);
  };

  // Handle pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPanX(panX + dx);
    setPanY(panY + dy);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle location click
  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked on a location
    locations.forEach((location) => {
      const { x, y } = latLngToCanvas(location.lat, location.lng, canvas.width, canvas.height);
      const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
      if (distance < 15) {
        setSelectedLocation(location);
        onLocationClick?.(location);
        toast.success(`Selected: ${location.name}`);
      }
    });
  };

  // Redraw on state change
  useEffect(() => {
    drawMap();
  }, [zoom, panX, panY, locations, selectedLocation]);

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <div className="space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Flat World Map
          </h3>
          <div className="text-xs text-slate-400">
            Lat: {selectedLocation?.lat.toFixed(2) || '—'} | Lng:{' '}
            {selectedLocation?.lng.toFixed(2) || '—'}
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full border-2 border-cyan-500 rounded-lg cursor-grab active:cursor-grabbing bg-slate-950"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
        />

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => handleZoom('in')}
            variant="default"
            className="gap-2 bg-cyan-600 hover:bg-cyan-700"
          >
            <ZoomIn className="w-4 h-4" />
            Zoom In
          </Button>

          <Button
            onClick={() => handleZoom('out')}
            variant="default"
            className="gap-2 bg-cyan-600 hover:bg-cyan-700"
          >
            <ZoomOut className="w-4 h-4" />
            Zoom Out
          </Button>

          <Button
            onClick={() => {
              setPanX(0);
              setPanY(0);
              setZoom(2);
              toast.success('Map reset');
            }}
            variant="outline"
            className="gap-2"
          >
            <Navigation className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Locations List */}
        {locations.length > 0 && (
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">Tracked Locations:</p>
            <div className="space-y-1">
              {locations.map((loc) => (
                <div
                  key={`${loc.lat}-${loc.lng}`}
                  onClick={() => {
                    setSelectedLocation(loc);
                    onLocationClick?.(loc);
                  }}
                  className="text-xs text-slate-300 cursor-pointer hover:text-cyan-400 p-1 rounded hover:bg-slate-700 transition-colors"
                >
                  <span className="font-mono">
                    {loc.name} ({loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
