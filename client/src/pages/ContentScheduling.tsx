import React, { useState } from 'react';
import { Calendar, Clock, Zap, BarChart3, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScheduleEntry {
  id: string;
  time: string;
  content: string;
  channel: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
  aiOptimized: boolean;
  expectedListeners: number;
}

export default function ContentScheduling() {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([
    {
      id: '1',
      time: '06:00',
      content: '432Hz - Morning Meditation',
      channel: '432Hz - Heart Chakra',
      duration: 60,
      priority: 'high',
      aiOptimized: true,
      expectedListeners: 45
    },
    {
      id: '2',
      time: '09:00',
      content: 'Jazz Frequencies - Work Focus',
      channel: 'Jazz Frequencies',
      duration: 120,
      priority: 'high',
      aiOptimized: true,
      expectedListeners: 78
    },
    {
      id: '3',
      time: '12:00',
      content: 'Lunch Hour - Mixed Frequencies',
      channel: 'Special Mix',
      duration: 60,
      priority: 'medium',
      aiOptimized: true,
      expectedListeners: 92
    },
    {
      id: '4',
      time: '18:00',
      content: 'Evening Relaxation - 528Hz',
      channel: '528Hz - Throat Chakra',
      duration: 90,
      priority: 'high',
      aiOptimized: true,
      expectedListeners: 156
    },
    {
      id: '5',
      time: '21:00',
      content: 'Night Sleep - 174Hz',
      channel: '174Hz - Root Chakra',
      duration: 120,
      priority: 'high',
      aiOptimized: true,
      expectedListeners: 203
    }
  ]);

  const [optimizationSettings, setOptimizationSettings] = useState({
    peakHourDetection: true,
    contentRotation: true,
    listenerPreferences: true,
    aiRecommendations: true,
    autoAdjustment: true
  });

  const peakHours = [
    { hour: '06:00-09:00', listeners: 124, trend: 'up' },
    { hour: '12:00-14:00', listeners: 298, trend: 'up' },
    { hour: '18:00-21:00', listeners: 451, trend: 'stable' },
    { hour: '21:00-23:00', listeners: 203, trend: 'down' }
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Content Scheduling</h1>
          <p className="text-purple-200">QUMUS AI-Optimized Broadcasting</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Zap className="w-4 h-4 mr-2" />
          AI Optimize All
        </Button>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
          <Button
            key={day}
            variant={selectedDay === day ? 'default' : 'outline'}
            className={selectedDay === day ? 'bg-purple-600' : 'border-purple-500'}
            onClick={() => setSelectedDay(day)}
          >
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-slate-800 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} Schedule
              </CardTitle>
              <CardDescription>24-hour broadcast schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {schedule.map(entry => (
                <div key={entry.id} className="p-4 bg-slate-700 rounded-lg border border-purple-500/30 hover:border-purple-500 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white font-bold">{entry.time}</p>
                        <p className="text-purple-200 text-sm">{entry.content}</p>
                      </div>
                    </div>
                    {entry.aiOptimized && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        AI Optimized
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-purple-300">Channel:</span>
                      <p className="text-white">{entry.channel}</p>
                    </div>
                    <div>
                      <span className="text-purple-300">Duration:</span>
                      <p className="text-white">{entry.duration}m</p>
                    </div>
                    <div>
                      <span className="text-purple-300">Expected:</span>
                      <p className="text-white">{entry.expectedListeners} listeners</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Peak Hours & Optimization */}
        <div className="space-y-4">
          {/* Peak Hours */}
          <Card className="bg-slate-800 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Peak Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {peakHours.map((peak, idx) => (
                <div key={idx} className="p-3 bg-slate-700 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-purple-200 text-sm">{peak.hour}</span>
                    <span className="text-white font-bold">{peak.listeners}</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                      style={{ width: `${(peak.listeners / 451) * 100}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-1 ${peak.trend === 'up' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {peak.trend === 'up' ? '↑' : '→'} {peak.trend}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Optimization Settings */}
          <Card className="bg-slate-800 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                AI Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(optimizationSettings).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={value}
                    onChange={() => setOptimizationSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                    className="w-4 h-4 rounded border-purple-500 bg-slate-700"
                  />
                  <span className="text-purple-200 text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="bg-slate-800 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white text-lg">Today's Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-200">Total Listeners</span>
                <span className="text-white font-bold">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Avg Duration</span>
                <span className="text-white font-bold">52m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Engagement</span>
                <span className="text-green-400 font-bold">82%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Rotation */}
      <Card className="bg-slate-800 border-purple-500">
        <CardHeader>
          <CardTitle className="text-white">Content Rotation Algorithm</CardTitle>
          <CardDescription>Automatic content scheduling based on listener preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700 rounded">
              <p className="text-purple-200 text-sm mb-2">Morning (6AM-12PM)</p>
              <p className="text-white font-bold">Healing Frequencies</p>
              <p className="text-purple-300 text-xs mt-1">Meditation & Focus</p>
            </div>
            <div className="p-4 bg-slate-700 rounded">
              <p className="text-purple-200 text-sm mb-2">Afternoon (12PM-6PM)</p>
              <p className="text-white font-bold">Jazz & Rock Mix</p>
              <p className="text-purple-300 text-xs mt-1">Energy & Engagement</p>
            </div>
            <div className="p-4 bg-slate-700 rounded">
              <p className="text-purple-200 text-sm mb-2">Evening (6PM-12AM)</p>
              <p className="text-white font-bold">Relaxation & Sleep</p>
              <p className="text-purple-300 text-xs mt-1">Rest & Recovery</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
