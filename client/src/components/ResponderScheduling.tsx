import React, { useState } from 'react';
import { Calendar, Clock, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Responder {
  id: string;
  name: string;
  role: 'coordinator' | 'operator' | 'medical' | 'security' | 'volunteer';
  status: 'active' | 'inactive' | 'on-duty' | 'off-duty';
  currentCallCount: number;
  maxConcurrentCalls: number;
}

interface ScheduleSlot {
  id: string;
  responderId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: 'on-call' | 'available' | 'unavailable';
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

export function ResponderScheduling() {
  const [responders] = useState<Responder[]>([
    {
      id: 'resp-1',
      name: 'John Coordinator',
      role: 'coordinator',
      status: 'on-duty',
      currentCallCount: 2,
      maxConcurrentCalls: 5,
    },
    {
      id: 'resp-2',
      name: 'Jane Operator',
      role: 'operator',
      status: 'active',
      currentCallCount: 1,
      maxConcurrentCalls: 3,
    },
    {
      id: 'resp-3',
      name: 'Dr. Smith',
      role: 'medical',
      status: 'on-duty',
      currentCallCount: 0,
      maxConcurrentCalls: 2,
    },
  ]);

  const [schedules, setSchedules] = useState<ScheduleSlot[]>([
    {
      id: 'slot-1',
      responderId: 'resp-1',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      type: 'on-call',
    },
    {
      id: 'slot-2',
      responderId: 'resp-2',
      dayOfWeek: 'Monday',
      startTime: '14:00',
      endTime: '22:00',
      type: 'available',
    },
  ]);

  const [selectedResponder, setSelectedResponder] = useState<string | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    type: 'on-call' as const,
  });

  const handleAddSlot = () => {
    if (!selectedResponder) return;

    const slot: ScheduleSlot = {
      id: `slot-${Date.now()}`,
      responderId: selectedResponder,
      ...newSlot,
    };

    setSchedules([...schedules, slot]);
    setNewSlot({
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      type: 'on-call',
    });
    setShowAddSlot(false);
  };

  const handleDeleteSlot = (slotId: string) => {
    setSchedules(schedules.filter(s => s.id !== slotId));
  };

  const getResponderSchedule = (responderId: string) => {
    return schedules.filter(s => s.responderId === responderId);
  };

  const getResponderName = (responderId: string) => {
    return responders.find(r => r.id === responderId)?.name || 'Unknown';
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Responder Scheduling</h1>
        <p className="text-gray-400">Manage on-call schedules and responder availability</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Responder List */}
        <div className="col-span-1">
          <Card className="bg-slate-700 border-slate-600 p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Responders</h2>
            <div className="space-y-2">
              {responders.map(responder => (
                <button
                  key={responder.id}
                  onClick={() => setSelectedResponder(responder.id)}
                  className={`w-full text-left p-4 rounded transition-colors ${
                    selectedResponder === responder.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        responder.status === 'on-duty'
                          ? 'bg-green-500'
                          : responder.status === 'active'
                            ? 'bg-blue-500'
                            : 'bg-gray-500'
                      }`}
                    />
                    {responder.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{responder.role}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {responder.currentCallCount}/{responder.maxConcurrentCalls} calls
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Schedule View */}
        <div className="col-span-2">
          {selectedResponder ? (
            <div className="space-y-6">
              {/* Weekly Schedule */}
              <Card className="bg-slate-700 border-slate-600 p-6">
                <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Schedule: {getResponderName(selectedResponder)}
                </h2>

                <div className="space-y-3">
                  {DAYS_OF_WEEK.map(day => {
                    const daySchedules = getResponderSchedule(selectedResponder).filter(s => s.dayOfWeek === day);

                    return (
                      <div key={day} className="bg-slate-800 p-4 rounded">
                        <div className="font-semibold text-white mb-2">{day}</div>
                        {daySchedules.length > 0 ? (
                          <div className="space-y-2">
                            {daySchedules.map(slot => (
                              <div key={slot.id} className="flex items-center justify-between bg-slate-700 p-3 rounded">
                                <div className="flex items-center gap-3">
                                  <Clock className="w-4 h-4 text-blue-400" />
                                  <div>
                                    <div className="text-sm font-semibold">
                                      {slot.startTime} - {slot.endTime}
                                    </div>
                                    <div
                                      className={`text-xs ${
                                        slot.type === 'on-call'
                                          ? 'text-green-400'
                                          : slot.type === 'available'
                                            ? 'text-blue-400'
                                            : 'text-red-400'
                                      }`}
                                    >
                                      {slot.type === 'on-call' ? '🔴 On-Call' : slot.type === 'available' ? '🟢 Available' : '🔴 Unavailable'}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="text-red-400 hover:text-red-300 p-2"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">No schedule set</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Add Schedule Slot */}
              <Card className="bg-slate-700 border-slate-600 p-6">
                <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Schedule Slot
                </h3>

                {!showAddSlot ? (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3" onClick={() => setShowAddSlot(true)}>
                    + Add New Slot
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Day of Week</label>
                      <select
                        value={newSlot.dayOfWeek}
                        onChange={e => setNewSlot({ ...newSlot, dayOfWeek: e.target.value })}
                        className="w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-600"
                      >
                        {DAYS_OF_WEEK.map(day => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Start Time</label>
                        <select
                          value={newSlot.startTime}
                          onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                          className="w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-600"
                        >
                          {HOURS.map(hour => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">End Time</label>
                        <select
                          value={newSlot.endTime}
                          onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                          className="w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-600"
                        >
                          {HOURS.map(hour => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Type</label>
                      <div className="flex gap-2">
                        {(['on-call', 'available', 'unavailable'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setNewSlot({ ...newSlot, type })}
                            className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-colors ${
                              newSlot.type === type
                                ? type === 'on-call'
                                  ? 'bg-green-600 text-white'
                                  : type === 'available'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-red-600 text-white'
                                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                            }`}
                          >
                            {type === 'on-call' ? '🔴 On-Call' : type === 'available' ? '🟢 Available' : '🔴 Unavailable'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2" onClick={handleAddSlot}>
                        Save Slot
                      </Button>
                      <Button
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2"
                        onClick={() => setShowAddSlot(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="bg-slate-700 border-slate-600 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Select a responder to view and manage their schedule</p>
            </Card>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        <Card className="bg-slate-700 border-slate-600 p-6">
          <div className="text-gray-400 text-sm mb-2">Total Responders</div>
          <div className="text-3xl font-bold text-white">{responders.length}</div>
        </Card>

        <Card className="bg-slate-700 border-slate-600 p-6">
          <div className="text-gray-400 text-sm mb-2">On-Duty</div>
          <div className="text-3xl font-bold text-green-400">{responders.filter(r => r.status === 'on-duty').length}</div>
        </Card>

        <Card className="bg-slate-700 border-slate-600 p-6">
          <div className="text-gray-400 text-sm mb-2">Active Calls</div>
          <div className="text-3xl font-bold text-blue-400">{responders.reduce((sum, r) => sum + r.currentCallCount, 0)}</div>
        </Card>

        <Card className="bg-slate-700 border-slate-600 p-6">
          <div className="text-gray-400 text-sm mb-2">Total Capacity</div>
          <div className="text-3xl font-bold text-yellow-400">{responders.reduce((sum, r) => sum + r.maxConcurrentCalls, 0)}</div>
        </Card>
      </div>
    </div>
  );
}
