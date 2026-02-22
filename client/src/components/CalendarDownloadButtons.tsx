/**
 * Calendar Download Buttons Component
 * Provides multiple calendar integration options for panelists
 */

import React, { useState } from 'react';
import { Calendar, Download, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarDownloadButtonsProps {
  eventName: string;
  eventDate: string;
  eventTime: string;
  zoomLink: string;
  meetingId: string;
  panelistName: string;
}

export const CalendarDownloadButtons: React.FC<CalendarDownloadButtonsProps> = ({
  eventName,
  eventDate,
  eventTime,
  zoomLink,
  meetingId,
  panelistName,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDownloadICS = () => {
    // Generate ICS content
    const [year, month, day] = eventDate.split('-');
    const [hour, minute] = eventTime.split(':');
    
    const startDateTime = `${year}${month}${day}T${hour}${minute}00Z`;
    const endDateTime = `${year}${month}${day}T${parseInt(hour) + 2}${minute}00Z`;
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SQUADD//UN WCS Parallel Event//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:UN WCS Parallel Event
X-WR-TIMEZONE:UTC
BEGIN:VEVENT
UID:squadd-wcs-${meetingId}-${Date.now()}@manusweb.manus.space
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDateTime}
DTEND:${endDateTime}
SUMMARY:${eventName} - SQUADD Broadcast
DESCRIPTION:SQUADD UN WCS Parallel Event\\nZoom Meeting ID: ${meetingId}\\nJoin: ${zoomLink}
LOCATION:Online - Zoom
URL:${zoomLink}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

    // Create download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent));
    element.setAttribute('download', `UN-WCS-${eventDate.replace(/-/g, '')}-${panelistName.replace(/\s+/g, '-')}.ics`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setShowMenu(false);
  };

  const handleGoogleCalendar = () => {
    const [year, month, day] = eventDate.split('-');
    const [hour, minute] = eventTime.split(':');
    
    const startTime = `${year}${month}${day}T${hour}${minute}00Z`;
    const endTime = `${year}${month}${day}T${parseInt(hour) + 2}${minute}00Z`;
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${eventName} - SQUADD UN WCS Broadcast`,
      dates: `${startTime}/${endTime}`,
      details: `Zoom Meeting ID: ${meetingId}\n\nJoin: ${zoomLink}`,
      location: 'Online - Zoom',
      ctz: 'UTC',
    });
    
    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
    setShowMenu(false);
  };

  const handleOutlookCalendar = () => {
    const [year, month, day] = eventDate.split('-');
    const [hour, minute] = eventTime.split(':');
    
    const startTime = `${year}-${month}-${day}T${hour}:${minute}:00`;
    const endTime = `${year}-${month}-${day}T${parseInt(hour) + 2}:${minute}:00`;
    
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      startdt: startTime,
      enddt: endTime,
      subject: `${eventName} - SQUADD UN WCS Broadcast`,
      body: `Zoom Meeting ID: ${meetingId}\n\nJoin: ${zoomLink}`,
      location: 'Online - Zoom',
    });
    
    window.open(`https://outlook.live.com/calendar/0/compose?${params.toString()}`, '_blank');
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Add to Calendar
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>

      {showMenu && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10">
          <button
            onClick={handleDownloadICS}
            className="w-full px-4 py-3 text-left text-gray-200 hover:bg-slate-600 flex items-center gap-2 border-b border-slate-600"
          >
            <Download className="w-4 h-4" />
            <div>
              <div className="font-medium">Download as .ics</div>
              <div className="text-xs text-gray-400">For Apple Calendar, Outlook, etc.</div>
            </div>
          </button>

          <button
            onClick={handleGoogleCalendar}
            className="w-full px-4 py-3 text-left text-gray-200 hover:bg-slate-600 flex items-center gap-2 border-b border-slate-600"
          >
            <ExternalLink className="w-4 h-4" />
            <div>
              <div className="font-medium">Google Calendar</div>
              <div className="text-xs text-gray-400">Opens in new window</div>
            </div>
          </button>

          <button
            onClick={handleOutlookCalendar}
            className="w-full px-4 py-3 text-left text-gray-200 hover:bg-slate-600 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <div>
              <div className="font-medium">Outlook Calendar</div>
              <div className="text-xs text-gray-400">Opens in new window</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
