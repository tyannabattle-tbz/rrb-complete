import React, { useEffect, useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Rectangle, GeoJSON, useMap } from 'react-leaflet';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Map, Navigation, AlertTriangle, Package, Radio, Heart, Eye, Download, Share2, Maximize2, Settings, Layers, Crosshair } from 'lucide-react';
import L from 'leaflet';

interface TacticalAsset {
  id: string;
  name: string;
  type: 'drone' | 'broadcast' | 'logistics' | 'medical' | 'supply' | 'command';
  location: { lat: number; lng: number };
  status: 'active' | 'idle' | 'warning' | 'critical';
  heading?: number;
  speed?: number;
  altitude?: number;
  metadata?: Record<string, any>;
}

interface Incident {
  id: string;
  type: 'threat' | 'emergency' | 'alert' | 'info';
  location: { lat: number; lng: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

interface DeliveryRoute {
  id: string;
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  waypoints: Array<{ lat: number; lng: number }>;
  distance: number;
  estimatedTime: number;
  status: 'pending' | 'in-progress' | 'completed';
  droneId: string;
}

interface InfrastructureHub {
  id: string;
  name: string;
  type: 'broadcast' | 'logistics' | 'fundraising' | 'medical' | 'command';
  location: { lat: number; lng: number };
  status: 'operational' | 'maintenance' | 'offline';
  capacity: number;
  utilization: number;
  services: string[];
}

const TACTICAL_COLORS = {
  drone: '#3b82f6',
  broadcast: '#ef4444',
  logistics: '#f59e0b',
  medical: '#ec4899',
  supply: '#10b981',
  command: '#8b5cf6',
  threat: '#dc2626',
  emergency: '#f97316',
  alert: '#eab308',
  info: '#06b6d4',
};

const INCIDENT_ICONS = {
  threat: '⚠️',
  emergency: '🚨',
  alert: '⚡',
  info: 'ℹ️',
};

const MapArsenal: React.FC = () => {
  const [assets, setAssets] = useState<TacticalAsset[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [hubs, setHubs] = useState<InfrastructureHub[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<TacticalAsset | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [mapMode, setMapMode] = useState<'tactical' | 'logistics' | 'infrastructure' | 'incidents'>('tactical');
  const [showLayers, setShowLayers] = useState({
    assets: true,
    incidents: true,
    routes: true,
    hubs: true,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<any>(null);

  // Fetch tactical assets
  const { data: assetsData } = trpc.mapArsenal.getAssets.useQuery();

  // Fetch incidents
  const { data: incidentsData } = trpc.mapArsenal.getIncidents.useQuery();

  // Fetch delivery routes
  const { data: routesData } = trpc.mapArsenal.getRoutes.useQuery();

  // Fetch infrastructure hubs
  const { data: hubsData } = trpc.mapArsenal.getHubs.useQuery();

  useEffect(() => {
    if (assetsData) setAssets(assetsData);
    if (incidentsData) setIncidents(incidentsData);
    if (routesData) setRoutes(routesData);
    if (hubsData) setHubs(hubsData);
  }, [assetsData, incidentsData, routesData, hubsData]);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'drone':
        return '🛸';
      case 'broadcast':
        return '📡';
      case 'logistics':
        return '📦';
      case 'medical':
        return '🏥';
      case 'supply':
        return '📦';
      case 'command':
        return '🎖️';
      default:
        return '📍';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'idle':
        return '#6b7280';
      case 'warning':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getHubIcon = (type: string) => {
    switch (type) {
      case 'broadcast':
        return '📡';
      case 'logistics':
        return '🏭';
      case 'fundraising':
        return '❤️';
      case 'medical':
        return '🏥';
      case 'command':
        return '🎖️';
      default:
        return '🏢';
    }
  };

  const handleExport = (format: 'pdf' | 'image') => {
    console.log(`Exporting map as ${format}`);
    // Implementation for export functionality
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const assetStats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'active').length,
    warning: assets.filter(a => a.status === 'warning').length,
    critical: assets.filter(a => a.status === 'critical').length,
  };

  const incidentStats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    active: incidents.filter(i => i.status === 'active').length,
  };

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50' : ''} bg-slate-900 text-white`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Map className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold">Military-Grade Map Arsenal</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport('pdf')}
              className="text-white border-slate-600 hover:bg-slate-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleFullscreen}
              className="text-white border-slate-600 hover:bg-slate-700"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-120px)]'}`}>
        {/* Sidebar */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          {/* Mode Selection */}
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Map Mode</h2>
            <div className="grid grid-cols-2 gap-2">
              {(['tactical', 'logistics', 'infrastructure', 'incidents'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMapMode(mode)}
                  className={`px-3 py-2 rounded text-xs font-semibold transition-colors ${
                    mapMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Layer Controls */}
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Layers
            </h2>
            <div className="space-y-2">
              {Object.entries(showLayers).map(([layer, visible]) => (
                <label key={layer} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) =>
                      setShowLayers({ ...showLayers, [layer]: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300 capitalize">{layer}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Statistics</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Assets</span>
                <span className="text-white font-semibold">{assetStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active</span>
                <span className="text-green-400 font-semibold">{assetStats.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Warning</span>
                <span className="text-yellow-400 font-semibold">{assetStats.warning}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Critical</span>
                <span className="text-red-400 font-semibold">{assetStats.critical}</span>
              </div>
            </div>
          </div>

          {/* Incidents Panel */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Active Incidents ({incidentStats.active})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {incidents
                .filter(i => i.status === 'active')
                .map((incident) => (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedIncident?.id === incident.id
                        ? 'bg-blue-600'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{INCIDENT_ICONS[incident.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {incident.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          Severity: {incident.severity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 bg-slate-900 relative">
          <MapContainer
            center={[40.7128, -74.006]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Render Assets */}
            {showLayers.assets &&
              assets.map((asset) => (
                <Marker
                  key={asset.id}
                  position={[asset.location.lat, asset.location.lng]}
                  icon={L.divIcon({
                    html: `
                      <div style="
                        background-color: ${getStatusColor(asset.status)};
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        border: 2px solid white;
                        box-shadow: 0 0 10px rgba(0,0,0,0.5);
                      ">
                        ${getAssetIcon(asset.type)}
                      </div>
                    `,
                    className: 'asset-marker',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                  })}
                  eventHandlers={{
                    click: () => setSelectedAsset(asset),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{asset.name}</p>
                      <p className="text-xs text-gray-600">Type: {asset.type}</p>
                      <p className="text-xs text-gray-600">Status: {asset.status}</p>
                      {asset.speed && (
                        <p className="text-xs text-gray-600">Speed: {asset.speed} km/h</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* Render Incidents */}
            {showLayers.incidents &&
              incidents.map((incident) => (
                <Circle
                  key={incident.id}
                  center={[incident.location.lat, incident.location.lng]}
                  radius={500}
                  pathOptions={{
                    color: incident.severity === 'critical' ? '#dc2626' : '#f59e0b',
                    fillColor: incident.severity === 'critical' ? '#dc2626' : '#f59e0b',
                    fillOpacity: 0.3,
                  }}
                  eventHandlers={{
                    click: () => setSelectedIncident(incident),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{incident.description}</p>
                      <p className="text-xs text-gray-600">Type: {incident.type}</p>
                      <p className="text-xs text-gray-600">Severity: {incident.severity}</p>
                    </div>
                  </Popup>
                </Circle>
              ))}

            {/* Render Routes */}
            {showLayers.routes &&
              routes.map((route) => (
                <Polyline
                  key={route.id}
                  positions={[
                    [route.origin.lat, route.origin.lng],
                    ...route.waypoints.map(wp => [wp.lat, wp.lng]),
                    [route.destination.lat, route.destination.lng],
                  ] as [number, number][]}
                  pathOptions={{
                    color: route.status === 'completed' ? '#10b981' : '#3b82f6',
                    weight: 2,
                    opacity: 0.8,
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{route.droneId}</p>
                      <p className="text-xs text-gray-600">Distance: {route.distance} km</p>
                      <p className="text-xs text-gray-600">ETA: {route.estimatedTime} min</p>
                    </div>
                  </Popup>
                </Polyline>
              ))}

            {/* Render Infrastructure Hubs */}
            {showLayers.hubs &&
              hubs.map((hub) => (
                <Marker
                  key={hub.id}
                  position={[hub.location.lat, hub.location.lng]}
                  icon={L.divIcon({
                    html: `
                      <div style="
                        background-color: ${hub.status === 'operational' ? '#10b981' : '#ef4444'};
                        width: 40px;
                        height: 40px;
                        border-radius: 4px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                        border: 2px solid white;
                        box-shadow: 0 0 10px rgba(0,0,0,0.5);
                      ">
                        ${getHubIcon(hub.type)}
                      </div>
                    `,
                    className: 'hub-marker',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                  })}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{hub.name}</p>
                      <p className="text-xs text-gray-600">Type: {hub.type}</p>
                      <p className="text-xs text-gray-600">Status: {hub.status}</p>
                      <p className="text-xs text-gray-600">
                        Utilization: {hub.utilization}%
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setMapMode('tactical')}
            >
              <Crosshair className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Info Panel */}
      {selectedAsset && (
        <div className="absolute bottom-4 left-4 bg-slate-800 border border-slate-700 rounded-lg p-4 max-w-sm">
          <h3 className="font-bold text-white mb-2">{selectedAsset.name}</h3>
          <div className="text-sm text-slate-300 space-y-1">
            <p>Type: {selectedAsset.type}</p>
            <p>Status: {selectedAsset.status}</p>
            {selectedAsset.speed && <p>Speed: {selectedAsset.speed} km/h</p>}
            {selectedAsset.altitude && <p>Altitude: {selectedAsset.altitude}m</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapArsenal;
