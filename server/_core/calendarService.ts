/**
 * Calendar Integration Service
 * Generates .ics (iCalendar) files for panelist events
 */

/**
 * Generate iCalendar (.ics) file content
 */
export function generateICSFile(options: {
  panelistName: string;
  eventName: string;
  eventDate: string; // Format: YYYY-MM-DD
  eventTime: string; // Format: HH:MM UTC
  eventDescription: string;
  zoomLink: string;
  meetingId: string;
  passcode: string;
  location?: string;
}): string {
  const {
    panelistName,
    eventName,
    eventDate,
    eventTime,
    eventDescription,
    zoomLink,
    meetingId,
    passcode,
    location = 'Online - Zoom',
  } = options;

  // Parse date and time
  const [year, month, day] = eventDate.split('-');
  const [hour, minute] = eventTime.split(':');

  // Create UTC datetime string (format: YYYYMMDDTHHMMSSZ)
  const startDateTime = `${year}${month}${day}T${hour}${minute}00Z`;
  const endDateTime = `${year}${month}${day}T${parseInt(hour) + 2}${minute}00Z`; // 2-hour event

  // Generate unique UID
  const uid = `squadd-wcs-${meetingId}-${Date.now()}@manusweb.manus.space`;

  // Create iCalendar content
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SQUADD//UN WCS Parallel Event//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:UN WCS Parallel Event
X-WR-TIMEZONE:UTC
X-WR-CALDESC:SQUADD UN WCS Parallel Event Invitation
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDateTime}
DTEND:${endDateTime}
SUMMARY:${eventName} - SQUADD Broadcast
DESCRIPTION:${eventDescription}\\n\\nZoom Meeting ID: ${meetingId}\\nPasscode: ${passcode}\\n\\nJoin Link: ${zoomLink}\\n\\nSISTERS QUESTING UNAPOLOGETICALLY AFTER DIVINE DESTINY
LOCATION:${location}
URL:${zoomLink}
ORGANIZER;CN=SQUADD Broadcast Team:mailto:broadcast@squadd.org
ATTENDEE;CN=${panelistName};RSVP=TRUE:mailto:panelist@example.com
STATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

/**
 * Generate downloadable .ics file
 */
export function createICSDownload(options: {
  panelistName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventDescription: string;
  zoomLink: string;
  meetingId: string;
  passcode: string;
}): { filename: string; content: string } {
  const icsContent = generateICSFile(options);
  
  // Create filename
  const eventDateFormatted = options.eventDate.replace(/-/g, '');
  const filename = `UN-WCS-${eventDateFormatted}-${options.panelistName.replace(/\s+/g, '-')}.ics`;

  return {
    filename,
    content: icsContent,
  };
}

/**
 * Generate Google Calendar link
 */
export function generateGoogleCalendarLink(options: {
  eventName: string;
  eventDate: string;
  eventTime: string;
  zoomLink: string;
  meetingId: string;
}): string {
  const { eventName, eventDate, eventTime, zoomLink, meetingId } = options;

  // Parse date and time
  const [year, month, day] = eventDate.split('-');
  const [hour, minute] = eventTime.split(':');

  // Create start and end times
  const startTime = `${year}${month}${day}T${hour}${minute}00Z`;
  const endTime = `${year}${month}${day}T${parseInt(hour) + 2}${minute}00Z`;

  // Build Google Calendar URL
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${eventName} - SQUADD UN WCS Broadcast`,
    dates: `${startTime}/${endTime}`,
    details: `Zoom Meeting ID: ${meetingId}\n\nJoin: ${zoomLink}`,
    location: 'Online - Zoom',
    ctz: 'UTC',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar link
 */
export function generateOutlookCalendarLink(options: {
  eventName: string;
  eventDate: string;
  eventTime: string;
  zoomLink: string;
  meetingId: string;
}): string {
  const { eventName, eventDate, eventTime, zoomLink, meetingId } = options;

  // Parse date and time
  const [year, month, day] = eventDate.split('-');
  const [hour, minute] = eventTime.split(':');

  // Create start and end times (ISO format)
  const startTime = `${year}-${month}-${day}T${hour}:${minute}:00`;
  const endTime = `${year}-${month}-${day}T${parseInt(hour) + 2}:${minute}:00`;

  // Build Outlook Calendar URL
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    startdt: startTime,
    enddt: endTime,
    subject: `${eventName} - SQUADD UN WCS Broadcast`,
    body: `Zoom Meeting ID: ${meetingId}\n\nJoin: ${zoomLink}`,
    location: 'Online - Zoom',
  });

  return `https://outlook.live.com/calendar/0/compose?${params.toString()}`;
}

/**
 * Generate Apple Calendar link
 */
export function generateAppleCalendarLink(options: {
  eventName: string;
  eventDate: string;
  eventTime: string;
  zoomLink: string;
  meetingId: string;
}): string {
  const { eventName, eventDate, eventTime, zoomLink, meetingId } = options;

  // Parse date and time
  const [year, month, day] = eventDate.split('-');
  const [hour, minute] = eventTime.split(':');

  // Create datetime string
  const dateTime = `${year}${month}${day}T${hour}${minute}00Z`;

  // Build Apple Calendar URL
  const params = new URLSearchParams({
    title: `${eventName} - SQUADD UN WCS Broadcast`,
    dates: `${dateTime}/${dateTime}`,
    location: 'Online - Zoom',
    notes: `Zoom Meeting ID: ${meetingId}\n\nJoin: ${zoomLink}`,
  });

  return `webcal://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Get all calendar links for a panelist
 */
export function getAllCalendarLinks(options: {
  eventName: string;
  eventDate: string;
  eventTime: string;
  zoomLink: string;
  meetingId: string;
}): {
  ics: { filename: string; content: string };
  google: string;
  outlook: string;
  apple: string;
} {
  const icsData = createICSDownload({
    ...options,
    panelistName: 'Panelist',
    eventDescription: `SQUADD UN WCS Parallel Event - Sisters Questing Unapologetically After Divine Destiny`,
    passcode: 'Available in email',
  });

  return {
    ics: icsData,
    google: generateGoogleCalendarLink(options),
    outlook: generateOutlookCalendarLink(options),
    apple: generateAppleCalendarLink(options),
  };
}
