import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Plus, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { contentScheduleService, ScheduledContent, DailySchedule } from '@/services/contentScheduleService';

export function ContentScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState<DailySchedule>(contentScheduleService.getScheduleForDate(selectedDate));
  const [currentContent, setCurrentContent] = useState<ScheduledContent | null>(contentScheduleService.getCurrentContent());
  const [isRunning, setIsRunning] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsubscribe = contentScheduleService.onContentChange((content) => {
      setCurrentContent(content);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    setSchedule(contentScheduleService.getScheduleForDate(selectedDate));
  }, [selectedDate]);

  const handleStartSchedule = () => {
    contentScheduleService.startSchedule();
    setIsRunning(true);
  };

  const handleStopSchedule = () => {
    contentScheduleService.stopSchedule();
    setIsRunning(false);
  };

  const handleDeleteContent = (contentId: string) => {
    contentScheduleService.removeContent(contentId);
    setSchedule(contentScheduleService.getScheduleForDate(selectedDate));
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">24/7 Content Scheduler</h2>
        </div>
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStartSchedule}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Schedule
            </Button>
          ) : (
            <Button
              onClick={handleStopSchedule}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            >
              ⏹ Stop Schedule
            </Button>
          )}
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Schedule Status</p>
            <p className="text-lg font-bold text-gray-800">
              {isRunning ? '🟢 Running' : '🔴 Stopped'}
            </p>
          </div>
          {currentContent && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Now Playing</p>
              <p className="text-lg font-bold text-gray-800">{currentContent.title}</p>
              <p className="text-xs text-gray-500">{currentContent.type}</p>
            </div>
          )}
        </div>
      </div>

      {/* Date Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Schedule Timeline */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Schedule for {selectedDate}
        </h3>

        {schedule.timeSlots.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">No content scheduled for this date</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {schedule.timeSlots.map((timeSlot) =>
              timeSlot.content.map((content) => (
                <div
                  key={content.id}
                  className={`p-4 rounded-lg border-l-4 transition-all ${
                    currentContent?.id === content.id
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{content.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatTime(content.startTime)} - {formatTime(content.endTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {content.type}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        {formatDuration(content.duration)}
                      </span>
                      {content.frequency && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                          {content.frequency} Hz
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{content.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        content.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : content.priority === 'normal'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {content.priority.toUpperCase()}
                      </span>
                      {content.isLive && (
                        <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-700 flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleDeleteContent(content.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Schedule Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Total Duration</p>
          <p className="text-2xl font-bold text-blue-600">{formatDuration(schedule.totalDuration)}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600">Content Items</p>
          <p className="text-2xl font-bold text-purple-600">
            {schedule.timeSlots.reduce((sum, ts) => sum + ts.content.length, 0)}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Status</p>
          <p className="text-2xl font-bold text-green-600">{isRunning ? '🟢 Live' : '⚪ Idle'}</p>
        </div>
      </div>
    </div>
  );
}
