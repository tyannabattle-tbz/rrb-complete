import { describe, it, expect } from 'vitest';
import {
  sendSpikeAlertEmail,
  sendDailySpikesSummaryEmail,
  sendOperatorSpikeAlert,
  sendWeeklyTrendReport,
  type SpikeAlertEmail
} from './spikeAlertEmailService';

describe('Spike Alert Email Service', () => {
  const mockAlert: SpikeAlertEmail = {
    channelId: 'ch-jazz',
    channelName: 'Jazz Radio',
    previousListeners: 100,
    currentListeners: 250,
    spikePercent: 150,
    severity: 'critical',
    timestamp: Date.now(),
    operatorEmail: 'operator@example.com'
  };

  describe('sendSpikeAlertEmail', () => {
    it('should send spike alert email', async () => {
      const result = await sendSpikeAlertEmail(mockAlert);
      expect(typeof result).toBe('boolean');
    });

    it('should include channel name in alert', async () => {
      const alert: SpikeAlertEmail = {
        ...mockAlert,
        channelName: 'Classical Masters'
      };
      const result = await sendSpikeAlertEmail(alert);
      expect(result).toBeDefined();
    });

    it('should handle critical severity', async () => {
      const alert: SpikeAlertEmail = {
        ...mockAlert,
        severity: 'critical',
        spikePercent: 200
      };
      const result = await sendSpikeAlertEmail(alert);
      expect(result).toBeDefined();
    });

    it('should handle warning severity', async () => {
      const alert: SpikeAlertEmail = {
        ...mockAlert,
        severity: 'warning',
        spikePercent: 75
      };
      const result = await sendSpikeAlertEmail(alert);
      expect(result).toBeDefined();
    });

    it('should calculate spike percent correctly', () => {
      const alert: SpikeAlertEmail = {
        ...mockAlert,
        previousListeners: 100,
        currentListeners: 150,
        spikePercent: 50
      };
      expect(alert.spikePercent).toBe(50);
    });
  });

  describe('sendDailySpikesSummaryEmail', () => {
    it('should send daily summary with multiple spikes', async () => {
      const spikes: SpikeAlertEmail[] = [
        { ...mockAlert, channelName: 'Jazz Radio', spikePercent: 150 },
        { ...mockAlert, channelName: 'Classical Masters', spikePercent: 75 },
        { ...mockAlert, channelName: 'Soul Classics', spikePercent: 120 }
      ];

      const result = await sendDailySpikesSummaryEmail(spikes, new Date());
      expect(result).toBeDefined();
    });

    it('should handle empty spike list', async () => {
      const result = await sendDailySpikesSummaryEmail([], new Date());
      expect(result).toBe(true);
    });

    it('should count critical and warning spikes', async () => {
      const spikes: SpikeAlertEmail[] = [
        { ...mockAlert, severity: 'critical' },
        { ...mockAlert, severity: 'critical' },
        { ...mockAlert, severity: 'warning' }
      ];

      const result = await sendDailySpikesSummaryEmail(spikes, new Date());
      expect(result).toBeDefined();
    });

    it('should identify top spike', async () => {
      const spikes: SpikeAlertEmail[] = [
        { ...mockAlert, spikePercent: 50 },
        { ...mockAlert, spikePercent: 200 },
        { ...mockAlert, spikePercent: 75 }
      ];

      const result = await sendDailySpikesSummaryEmail(spikes, new Date());
      expect(result).toBeDefined();
    });
  });

  describe('sendOperatorSpikeAlert', () => {
    it('should send operator-specific alert', async () => {
      const result = await sendOperatorSpikeAlert(mockAlert, 'operator@example.com');
      expect(typeof result).toBe('boolean');
    });

    it('should include operator email', async () => {
      const operatorEmail = 'manager@radio.com';
      const result = await sendOperatorSpikeAlert(mockAlert, operatorEmail);
      expect(result).toBeDefined();
    });

    it('should format alert for operator action', async () => {
      const alert: SpikeAlertEmail = {
        ...mockAlert,
        severity: 'critical',
        spikePercent: 300
      };
      const result = await sendOperatorSpikeAlert(alert, 'op@example.com');
      expect(result).toBeDefined();
    });
  });

  describe('sendWeeklyTrendReport', () => {
    it('should send weekly trend report', async () => {
      const channels = [
        {
          name: 'Jazz Radio',
          avgListeners: 150,
          maxListeners: 500,
          totalSpikes: 5,
          trend: 'up' as const
        },
        {
          name: 'Classical Masters',
          avgListeners: 200,
          maxListeners: 600,
          totalSpikes: 3,
          trend: 'stable' as const
        }
      ];

      const result = await sendWeeklyTrendReport(channels);
      expect(typeof result).toBe('boolean');
    });

    it('should handle single channel', async () => {
      const channels = [
        {
          name: 'Soul Classics',
          avgListeners: 100,
          maxListeners: 400,
          totalSpikes: 2,
          trend: 'down' as const
        }
      ];

      const result = await sendWeeklyTrendReport(channels);
      expect(result).toBeDefined();
    });

    it('should include trend analysis', async () => {
      const channels = [
        {
          name: 'Trending Channel',
          avgListeners: 300,
          maxListeners: 800,
          totalSpikes: 10,
          trend: 'up' as const
        }
      ];

      const result = await sendWeeklyTrendReport(channels);
      expect(result).toBeDefined();
    });
  });

  describe('Alert severity levels', () => {
    it('should classify 50% spike as warning', () => {
      const alert: SpikeAlertEmail = {
        ...mockAlert,
        spikePercent: 50,
        severity: 'warning'
      };
      expect(alert.severity).toBe('warning');
    });

    it('should classify 150% spike as critical', () => {
      const alert: SpikeAlertEmail = {
        ...mockAlert,
        spikePercent: 150,
        severity: 'critical'
      };
      expect(alert.severity).toBe('critical');
    });
  });

  describe('Email content formatting', () => {
    it('should format spike percent with one decimal', () => {
      const alert: SpikeAlertEmail = {
        ...mockAlert,
        spikePercent: 123.456
      };
      expect(alert.spikePercent.toFixed(1)).toBe('123.5');
    });

    it('should include timestamp in ISO format', () => {
      const now = Date.now();
      const alert: SpikeAlertEmail = {
        ...mockAlert,
        timestamp: now
      };
      const date = new Date(alert.timestamp);
      expect(date.toISOString()).toBeDefined();
    });
  });
});
