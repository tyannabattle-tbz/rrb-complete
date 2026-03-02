import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, Truck, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';

interface DroneDelivery {
  id: string;
  droneId: string;
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  status: 'pending' | 'in-flight' | 'delivered' | 'failed';
  currentLocation: { lat: number; lng: number };
  distance: number;
  estimatedTime: number;
  actualTime?: number;
  payload: string;
  weight: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startTime: string;
  endTime?: string;
  encryptionLevel: 'military-grade' | 'high' | 'standard';
}

interface DroneFleet {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  battery: number;
  location: { lat: number; lng: number };
  altitude: number;
  speed: number;
  activeDeliveries: number;
  totalDeliveries: number;
  encryptionStatus: string;
}

interface LogisticsMetrics {
  totalDeliveries: number;
  successRate: number;
  averageDeliveryTime: number;
  activeFleet: number;
  totalDistance: number;
  securityIncidents: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const DroneLogisticsTracker: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DroneDelivery[]>([]);
  const [fleet, setFleet] = useState<DroneFleet[]>([]);
  const [metrics, setMetrics] = useState<LogisticsMetrics | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<DroneDelivery | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch deliveries
  const { data: deliveriesData } = trpc.droneLogistics.getDeliveries.useQuery();

  // Fetch fleet status
  const { data: fleetData } = trpc.droneLogistics.getFleetStatus.useQuery();

  // Fetch logistics metrics
  const { data: metricsData } = trpc.droneLogistics.getMetrics.useQuery();

  useEffect(() => {
    if (deliveriesData) setDeliveries(deliveriesData);
    if (fleetData) setFleet(fleetData);
    if (metricsData) setMetrics(metricsData);
    setLoading(false);
  }, [deliveriesData, fleetData, metricsData]);

  if (loading) {
    return <div className="p-4">Loading drone logistics data...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in-flight':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getEncryptionIcon = (level: string) => {
    switch (level) {
      case 'military-grade':
        return '🔐';
      case 'high':
        return '🔒';
      default:
        return '🔓';
    }
  };

  const deliveryTimeline = deliveries.map((d) => ({
    name: d.droneId,
    time: d.actualTime || d.estimatedTime,
    status: d.status,
  }));

  const fleetStatusData = [
    { name: 'Active', value: fleet.filter(f => f.status === 'active').length },
    { name: 'Idle', value: fleet.filter(f => f.status === 'idle').length },
    { name: 'Maintenance', value: fleet.filter(f => f.status === 'maintenance').length },
    { name: 'Offline', value: fleet.filter(f => f.status === 'offline').length },
  ];

  return (
    <div className="w-full space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header Banner */}
      <div className="rounded-lg bg-gradient-to-r from-slate-700 to-slate-900 p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Military-Grade Drone Logistics</h1>
        <p className="mt-2 text-lg font-semibold">Real-time Delivery & Fleet Management</p>
        <p className="mt-2 text-sm opacity-90">
          {fleet.length} drones • {deliveries.filter(d => d.status === 'in-flight').length} active deliveries
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="mt-2 text-3xl font-bold text-slate-700">
                {metrics?.totalDeliveries || 0}
              </p>
            </div>
            <Package className="h-8 w-8 text-slate-400" />
          </div>
        </Card>

        <Card className="bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {(metrics?.successRate || 0).toFixed(1)}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </Card>

        <Card className="bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {(metrics?.averageDeliveryTime || 0).toFixed(0)}m
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </Card>

        <Card className="bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Fleet</p>
              <p className="mt-2 text-3xl font-bold text-purple-600">
                {metrics?.activeFleet || 0}
              </p>
            </div>
            <Truck className="h-8 w-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Active Deliveries */}
      <Card className="p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Active Deliveries</h2>
        <div className="space-y-3">
          {deliveries.filter(d => d.status === 'in-flight').map((delivery) => (
            <div
              key={delivery.id}
              className={`rounded-lg border-l-4 p-4 ${getPriorityColor(delivery.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{delivery.droneId}</h3>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                    <span className="text-sm text-gray-600">{getEncryptionIcon(delivery.encryptionLevel)} {delivery.encryptionLevel}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {delivery.origin.name} → {delivery.destination.name}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Distance</p>
                      <p className="font-semibold text-gray-800">{delivery.distance} km</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ETA</p>
                      <p className="font-semibold text-gray-800">{delivery.estimatedTime} min</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Payload</p>
                      <p className="font-semibold text-gray-800">{delivery.weight} kg</p>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  Track
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Fleet Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fleet Distribution */}
        <Card className="p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Fleet Status Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={fleetStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {fleetStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Delivery Timeline */}
        <Card className="p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Delivery Timeline</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deliveryTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} min`} />
              <Bar dataKey="time" fill="#3b82f6" name="Delivery Time" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Fleet Details */}
      <Card className="p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Fleet Status</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fleet.map((drone) => (
            <div key={drone.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{drone.name}</h3>
                  <p className={`mt-1 rounded-full px-2 py-1 text-xs font-semibold inline-block ${getStatusColor(drone.status)}`}>
                    {drone.status}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Battery</span>
                  <span className="font-semibold text-gray-800">{drone.battery}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Altitude</span>
                  <span className="font-semibold text-gray-800">{drone.altitude}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Speed</span>
                  <span className="font-semibold text-gray-800">{drone.speed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Deliveries</span>
                  <span className="font-semibold text-gray-800">{drone.activeDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Deliveries</span>
                  <span className="font-semibold text-gray-800">{drone.totalDeliveries}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Security Status */}
      <Card className="p-6 shadow-md bg-gradient-to-r from-slate-50 to-slate-100">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Security & Compliance</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Military-Grade Encryption</p>
            <p className="mt-2 text-2xl font-bold text-green-600">✓ Active</p>
            <p className="mt-1 text-xs text-gray-500">All transmissions encrypted</p>
          </div>
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Security Incidents</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{metrics?.securityIncidents || 0}</p>
            <p className="mt-1 text-xs text-gray-500">Last 30 days</p>
          </div>
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Compliance Status</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">100%</p>
            <p className="mt-1 text-xs text-gray-500">Military standards</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DroneLogisticsTracker;
