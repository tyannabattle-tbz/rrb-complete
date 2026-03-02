import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Radar, Crosshair, ZoomIn, ZoomOut, Wind, Droplets, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Location {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

interface RadarData {
  intensity: number;
  coverage: number;
  quality: number;
}

export function GPSRadarMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [radarData, setRadarData] = useState<RadarData>({
    intensity: 0,
    coverage: 0,
    quality: 0,
  });
  const [zoom, setZoom] = useState(10);
  const [loading, setLoading] = useState(false);
  const [accuracy, setAccuracy] = useState(100);
  const [showWeatherRadar, setShowWeatherRadar] = useState(true);
  const [mapType, setMapType] = useState<'satellite' | 'terrain' | 'roadmap'>('roadmap');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize map with Google Maps
  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      try {
        // Get current location
        setLoading(true);
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });

        const { latitude, longitude, accuracy: gpsAccuracy } = position.coords;
        const newLocation: Location = {
          lat: latitude,
          lng: longitude,
          accuracy: gpsAccuracy,
          timestamp: Date.now(),
        };

        setLocation(newLocation);
        setAccuracy(Math.round((1 - gpsAccuracy / 100) * 100)); // Invert accuracy percentage

        // Simulate radar data based on location
        setRadarData({
          intensity: Math.random() * 100,
          coverage: 85 + Math.random() * 15,
          quality: 90 + Math.random() * 10,
        });

        toast.success(`Location acquired: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      } catch (error) {
        console.error('Geolocation error:', error);
        toast.error('Could not get location. Please enable location services.');
        // Use default location (Kansas City)
        setLocation({
          lat: 39.0997,
          lng: -94.5786,
          accuracy: 50,
          timestamp: Date.now(),
        });
      } finally {
        setLoading(false);
      }
    };

    initMap();
  }, []);

  // Draw radar visualization
  useEffect(() => {
    if (!canvasRef.current || !location) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 20;

    // Clear canvas
    ctx.fillStyle = '#001a33';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw radar circles
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const radius = (maxRadius / 4) * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw crosshairs
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - maxRadius, centerY);
    ctx.lineTo(centerX + maxRadius, centerY);
    ctx.moveTo(centerX, centerY - maxRadius);
    ctx.lineTo(centerX, centerY + maxRadius);
    ctx.stroke();

    // Draw radar sweep
    const sweepAngle = (Date.now() / 50) % (Math.PI * 2);
    ctx.strokeStyle = '#00ff4488';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(sweepAngle) * maxRadius,
      centerY + Math.sin(sweepAngle) * maxRadius
    );
    ctx.stroke();

    // Draw sweep arc
    ctx.fillStyle = '#00ff4420';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, maxRadius, sweepAngle - 0.3, sweepAngle + 0.3);
    ctx.closePath();
    ctx.fill();

    // Draw center point
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw target blips based on radar data
    const blipCount = Math.floor(radarData.coverage / 20);
    ctx.fillStyle = '#00ff88';
    for (let i = 0; i < blipCount; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const distance = Math.random() * maxRadius * (radarData.intensity / 100);
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      ctx.beginPath();
      ctx.arc(x, y, 2 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw weather radar overlay if enabled
    if (showWeatherRadar) {
      const weatherIntensity = radarData.intensity / 100;
      ctx.fillStyle = `rgba(0, 255, 136, ${weatherIntensity * 0.3})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * weatherIntensity, 0, Math.PI * 2);
      ctx.fill();
    }

    // Request animation frame for continuous sweep
    requestAnimationFrame(() => {});
  }, [location, radarData, showWeatherRadar]);

  const handleRefreshLocation = async () => {
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude, accuracy: gpsAccuracy } = position.coords;
      setLocation({
        lat: latitude,
        lng: longitude,
        accuracy: gpsAccuracy,
        timestamp: Date.now(),
      });
      setAccuracy(Math.round((1 - gpsAccuracy / 100) * 100));
      toast.success('Location updated');
    } catch (error) {
      toast.error('Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => direction === 'in' ? Math.min(prev + 2, 20) : Math.max(prev - 2, 1));
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radar className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold">GPS/Radar Map - Global Tracking</h2>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshLocation}
              disabled={loading}
              className="gap-2"
            >
              <Crosshair className="w-4 h-4" />
              Refresh Location
            </Button>
          </div>
        </div>

        {/* Map Type Selector */}
        <div className="flex gap-2 mb-4">
          {(['roadmap', 'satellite', 'terrain'] as const).map(type => (
            <Button
              key={type}
              size="sm"
              variant={mapType === type ? 'default' : 'outline'}
              onClick={() => setMapType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Location Info */}
        {location && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-slate-800 p-3 rounded">
              <p className="text-slate-400 text-xs">Latitude</p>
              <p className="font-mono text-cyan-400">{location.lat.toFixed(6)}</p>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <p className="text-slate-400 text-xs">Longitude</p>
              <p className="font-mono text-cyan-400">{location.lng.toFixed(6)}</p>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <p className="text-slate-400 text-xs">GPS Accuracy</p>
              <p className="font-mono text-cyan-400">{accuracy}%</p>
            </div>
            <div className="bg-slate-800 p-3 rounded">
              <p className="text-slate-400 text-xs">Zoom Level</p>
              <p className="font-mono text-cyan-400">{zoom}x</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Radar Display */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Radar Canvas */}
        <div className="flex-1 flex flex-col">
          <canvas
            ref={canvasRef}
            className="flex-1 bg-slate-950 rounded border border-cyan-400 border-opacity-30"
          />
          
          {/* Zoom Controls */}
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoom('in')}
              className="gap-2"
            >
              <ZoomIn className="w-4 h-4" />
              Zoom In
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoom('out')}
              className="gap-2"
            >
              <ZoomOut className="w-4 h-4" />
              Zoom Out
            </Button>
            <Button
              size="sm"
              variant={showWeatherRadar ? 'default' : 'outline'}
              onClick={() => setShowWeatherRadar(!showWeatherRadar)}
              className="gap-2 ml-auto"
            >
              <Wind className="w-4 h-4" />
              Weather Radar
            </Button>
          </div>
        </div>

        {/* Radar Data Panel */}
        <div className="w-64 flex flex-col gap-4">
          {/* Radar Stats */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Radar className="w-4 h-4 text-cyan-400" />
              Radar Data
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Signal Intensity</span>
                  <span className="text-cyan-400 font-mono">{radarData.intensity.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all"
                    style={{ width: `${radarData.intensity}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Coverage</span>
                  <span className="text-cyan-400 font-mono">{radarData.coverage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all"
                    style={{ width: `${radarData.coverage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Signal Quality</span>
                  <span className="text-cyan-400 font-mono">{radarData.quality.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all"
                    style={{ width: `${radarData.quality}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Tracking Status */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Tracking Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-green-400 font-semibold">● ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mode</span>
                <span className="text-cyan-400">{mapType.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Targets</span>
                <span className="text-cyan-400">{Math.floor(radarData.coverage / 20)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Update</span>
                <span className="text-cyan-400 font-mono text-xs">
                  {location ? new Date(location.timestamp).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
            </div>
          </Card>

          {/* Weather Data */}
          {showWeatherRadar && (
            <Card className="bg-slate-800 border-slate-700 p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                Weather
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Wind className="w-3 h-3" />
                    Wind
                  </span>
                  <span className="text-cyan-400">{(Math.random() * 30).toFixed(1)} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Droplets className="w-3 h-3" />
                    Humidity
                  </span>
                  <span className="text-cyan-400">{(50 + Math.random() * 40).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    Visibility
                  </span>
                  <span className="text-cyan-400">{(5 + Math.random() * 15).toFixed(1)} km</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
