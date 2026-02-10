import { describe, it, expect, beforeEach } from 'vitest';
import { ContentSchedulerService, getContentScheduler } from './services/contentSchedulerService';

describe('ContentSchedulerService', () => {
  let scheduler: ContentSchedulerService;

  beforeEach(() => {
    scheduler = new ContentSchedulerService();
  });

  it('should initialize with default channels', () => {
    const channels = scheduler.getChannels();
    expect(channels.length).toBe(7);
    expect(channels[0].name).toBe('RRB Main Radio');
    expect(channels[0].currentContent).toBe('Top of the Sol Drive Show');
  });

  it('should initialize with default schedule slots', () => {
    const slots = scheduler.getScheduleSlots();
    expect(slots.length).toBe(62);
    expect(slots[0].title).toBe('Top of the Sol Drive Show');
  });

  it('should start and report running status', () => {
    scheduler.start();
    const status = scheduler.getStatus();
    expect(status.isRunning).toBe(true);
    expect(status.activeChannels).toBe(7);
    expect(status.totalSlots).toBe(62);
    expect(status.autonomyLevel).toBe(90);
  });

  it('should stop and report not running', () => {
    scheduler.start();
    scheduler.stop();
    const status = scheduler.getStatus();
    expect(status.isRunning).toBe(false);
  });

  it('should add a new schedule slot', () => {
    const newSlot = scheduler.addSlot({
      channelId: 'ch-001',
      startTime: '10:00',
      endTime: '11:00',
      contentType: 'radio',
      title: 'Test Show',
      priority: 5,
      daysOfWeek: [1, 2, 3],
      isActive: true,
    });
    expect(newSlot.id).toBeDefined();
    expect(newSlot.title).toBe('Test Show');
    expect(scheduler.getScheduleSlots().length).toBe(63);
  });

  it('should update a schedule slot', () => {
    const updated = scheduler.updateSlot('slot-001', { title: 'Updated Show' });
    expect(updated).not.toBeNull();
    expect(updated!.title).toBe('Updated Show');
  });

  it('should return null when updating non-existent slot', () => {
    const result = scheduler.updateSlot('non-existent', { title: 'Test' });
    expect(result).toBeNull();
  });

  it('should delete a schedule slot', () => {
    const result = scheduler.deleteSlot('slot-001');
    expect(result).toBe(true);
    expect(scheduler.getScheduleSlots().length).toBe(61);
  });

  it('should return false when deleting non-existent slot', () => {
    const result = scheduler.deleteSlot('non-existent');
    expect(result).toBe(false);
  });

  it('should get slots by channel', () => {
    const slots = scheduler.getSlotsByChannel('ch-001');
    expect(slots.length).toBeGreaterThan(0);
    slots.forEach(slot => expect(slot.channelId).toBe('ch-001'));
  });

  it('should trigger emergency override', () => {
    const result = scheduler.triggerEmergencyOverride('ch-001', 'Test Emergency');
    expect(result).toBe(true);
    const channel = scheduler.getChannel('ch-001');
    expect(channel?.currentContent).toBe('[EMERGENCY] Test Emergency');
  });

  it('should return false for emergency override on non-existent channel', () => {
    const result = scheduler.triggerEmergencyOverride('non-existent', 'Test');
    expect(result).toBe(false);
  });

  it('should set autonomy level with bounds', () => {
    scheduler.setAutonomyLevel(50);
    expect(scheduler.getStatus().autonomyLevel).toBe(50);
    scheduler.setAutonomyLevel(150);
    expect(scheduler.getStatus().autonomyLevel).toBe(100);
    scheduler.setAutonomyLevel(-10);
    expect(scheduler.getStatus().autonomyLevel).toBe(0);
  });

  it('should use Top of the Sol branding not morning', () => {
    const slots = scheduler.getScheduleSlots();
    const channels = scheduler.getChannels();
    const allText = [
      ...slots.map(s => s.title),
      ...channels.map(c => c.currentContent || ''),
    ].join(' ');
    expect(allText.toLowerCase()).not.toContain('morning');
    expect(allText).toContain('Top of the Sol');
  });
});

describe('getContentScheduler singleton', () => {
  it('should return the same instance', () => {
    const a = getContentScheduler();
    const b = getContentScheduler();
    expect(a).toBe(b);
  });
});
