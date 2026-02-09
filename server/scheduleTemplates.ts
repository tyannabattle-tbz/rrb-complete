/**
 * Schedule Templates
 * Pre-configured programming blocks for 24/7 scheduling
 */

export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  blocks: ProgrammingBlock[];
}

export interface ProgrammingBlock {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  contentType: string;
  priority: number;
  commercialFrequency: number; // percentage
}

/**
 * Top of the Sol Template (6 AM - 12 PM)
 */
export const MORNING_DRIVE_TEMPLATE: ScheduleTemplate = {
  id: 'top-of-the-sol',
  name: 'Top of the Sol',
  description: 'High-energy Top of the Sol programming with frequent commercials',
  blocks: [
    {
      dayOfWeek: 1, // Monday
      startTime: '06:00',
      endTime: '09:00',
      contentType: 'radio',
      priority: 10,
      commercialFrequency: 20,
    },
    {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '12:00',
      contentType: 'radio',
      priority: 9,
      commercialFrequency: 15,
    },
  ],
};

/**
 * Afternoon Template (12 PM - 6 PM)
 */
export const AFTERNOON_TEMPLATE: ScheduleTemplate = {
  id: 'afternoon',
  name: 'Afternoon Block',
  description: 'Mid-day programming with mixed content',
  blocks: [
    {
      dayOfWeek: 1,
      startTime: '12:00',
      endTime: '15:00',
      contentType: 'podcast',
      priority: 7,
      commercialFrequency: 12,
    },
    {
      dayOfWeek: 1,
      startTime: '15:00',
      endTime: '18:00',
      contentType: 'video',
      priority: 7,
      commercialFrequency: 10,
    },
  ],
};

/**
 * Evening Template (6 PM - 12 AM)
 */
export const EVENING_TEMPLATE: ScheduleTemplate = {
  id: 'evening',
  name: 'Evening Block',
  description: 'Prime-time programming with premium content',
  blocks: [
    {
      dayOfWeek: 1,
      startTime: '18:00',
      endTime: '21:00',
      contentType: 'video',
      priority: 10,
      commercialFrequency: 15,
    },
    {
      dayOfWeek: 1,
      startTime: '21:00',
      endTime: '00:00',
      contentType: 'radio',
      priority: 8,
      commercialFrequency: 12,
    },
  ],
};

/**
 * Overnight Template (12 AM - 6 AM)
 */
export const OVERNIGHT_TEMPLATE: ScheduleTemplate = {
  id: 'overnight',
  name: 'Overnight Block',
  description: 'Late-night programming with lower commercial frequency',
  blocks: [
    {
      dayOfWeek: 1,
      startTime: '00:00',
      endTime: '03:00',
      contentType: 'podcast',
      priority: 5,
      commercialFrequency: 8,
    },
    {
      dayOfWeek: 1,
      startTime: '03:00',
      endTime: '06:00',
      contentType: 'radio',
      priority: 5,
      commercialFrequency: 8,
    },
  ],
};

/**
 * Weekend Template
 */
export const WEEKEND_TEMPLATE: ScheduleTemplate = {
  id: 'weekend',
  name: 'Weekend Block',
  description: 'Relaxed weekend programming',
  blocks: [
    {
      dayOfWeek: 6, // Saturday
      startTime: '08:00',
      endTime: '12:00',
      contentType: 'podcast',
      priority: 6,
      commercialFrequency: 10,
    },
    {
      dayOfWeek: 6,
      startTime: '12:00',
      endTime: '18:00',
      contentType: 'video',
      priority: 6,
      commercialFrequency: 10,
    },
    {
      dayOfWeek: 6,
      startTime: '18:00',
      endTime: '23:00',
      contentType: 'radio',
      priority: 7,
      commercialFrequency: 12,
    },
    {
      dayOfWeek: 0, // Sunday
      startTime: '08:00',
      endTime: '12:00',
      contentType: 'podcast',
      priority: 6,
      commercialFrequency: 10,
    },
    {
      dayOfWeek: 0,
      startTime: '12:00',
      endTime: '18:00',
      contentType: 'video',
      priority: 6,
      commercialFrequency: 10,
    },
    {
      dayOfWeek: 0,
      startTime: '18:00',
      endTime: '23:00',
      contentType: 'radio',
      priority: 7,
      commercialFrequency: 12,
    },
  ],
};

/**
 * 24/7 Continuous Template
 */
export const CONTINUOUS_24_7_TEMPLATE: ScheduleTemplate = {
  id: 'continuous-24-7',
  name: '24/7 Continuous',
  description: 'Continuous content rotation throughout the day',
  blocks: [
    // Monday - Friday
    ...generateWeekdayBlocks(),
    // Saturday - Sunday
    ...generateWeekendBlocks(),
  ],
};

/**
 * Generate weekday blocks
 */
function generateWeekdayBlocks(): ProgrammingBlock[] {
  const blocks: ProgrammingBlock[] = [];
  const contentTypes = ['radio', 'podcast', 'video', 'radio'];
  const timeSlots = [
    { start: '00:00', end: '06:00' },
    { start: '06:00', end: '12:00' },
    { start: '12:00', end: '18:00' },
    { start: '18:00', end: '00:00' },
  ];

  for (let day = 1; day <= 5; day++) {
    timeSlots.forEach((slot, idx) => {
      blocks.push({
        dayOfWeek: day,
        startTime: slot.start,
        endTime: slot.end,
        contentType: contentTypes[idx],
        priority: idx === 1 ? 10 : idx === 2 ? 9 : 7,
        commercialFrequency: idx === 1 ? 20 : idx === 2 ? 15 : 10,
      });
    });
  }

  return blocks;
}

/**
 * Generate weekend blocks
 */
function generateWeekendBlocks(): ProgrammingBlock[] {
  const blocks: ProgrammingBlock[] = [];
  const contentTypes = ['podcast', 'video', 'radio', 'podcast'];
  const timeSlots = [
    { start: '00:00', end: '08:00' },
    { start: '08:00', end: '14:00' },
    { start: '14:00', end: '20:00' },
    { start: '20:00', end: '00:00' },
  ];

  for (let day = 0; day <= 6; day += 6) {
    // Saturday and Sunday
    timeSlots.forEach((slot, idx) => {
      blocks.push({
        dayOfWeek: day,
        startTime: slot.start,
        endTime: slot.end,
        contentType: contentTypes[idx],
        priority: 6,
        commercialFrequency: 10,
      });
    });
  }

  return blocks;
}

/**
 * All available templates
 */
export const ALL_TEMPLATES: ScheduleTemplate[] = [
  MORNING_DRIVE_TEMPLATE,
  AFTERNOON_TEMPLATE,
  EVENING_TEMPLATE,
  OVERNIGHT_TEMPLATE,
  WEEKEND_TEMPLATE,
  CONTINUOUS_24_7_TEMPLATE,
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ScheduleTemplate | undefined {
  return ALL_TEMPLATES.find(t => t.id === id);
}

/**
 * Get all template names
 */
export function getTemplateNames(): Array<{ id: string; name: string }> {
  return ALL_TEMPLATES.map(t => ({ id: t.id, name: t.name }));
}

/**
 * Apply template to schedule
 */
export function applyTemplate(template: ScheduleTemplate): ProgrammingBlock[] {
  return template.blocks;
}
