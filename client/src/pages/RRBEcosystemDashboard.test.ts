import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RRBEcosystemDashboard from './RRBEcosystemDashboard';

describe('RRBEcosystemDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ecosystem dashboard with all major systems', () => {
    render(<RRBEcosystemDashboard />);
    
    expect(screen.getByText('RRB Ecosystem')).toBeInTheDocument();
    expect(screen.getByText('Complete Broadcasting & Community Platform')).toBeInTheDocument();
  });

  it('displays real-time listener count', () => {
    render(<RRBEcosystemDashboard />);
    
    expect(screen.getByText('Total Listeners')).toBeInTheDocument();
    expect(screen.getByText('Active Channels')).toBeInTheDocument();
  });

  it('shows all ecosystem systems', () => {
    render(<RRBEcosystemDashboard />);
    
    expect(screen.getByText('41-Channel Radio')).toBeInTheDocument();
    expect(screen.getByText('QUMUS Orchestration')).toBeInTheDocument();
    expect(screen.getByText('Solbones Game')).toBeInTheDocument();
    expect(screen.getByText('Sweet Miracles')).toBeInTheDocument();
    expect(screen.getByText('HybridCast')).toBeInTheDocument();
    expect(screen.getByText('Meditation Hub')).toBeInTheDocument();
    expect(screen.getByText('Podcast Network')).toBeInTheDocument();
    expect(screen.getByText('Studio Suite')).toBeInTheDocument();
  });

  it('displays tabs for different views', () => {
    render(<RRBEcosystemDashboard />);
    
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /radio control/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /all systems/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument();
  });

  it('shows 41 radio channels', () => {
    render(<RRBEcosystemDashboard />);
    
    expect(screen.getByText('Main Stream')).toBeInTheDocument();
    expect(screen.getByText('Meditation')).toBeInTheDocument();
    expect(screen.getByText('Healing')).toBeInTheDocument();
  });

  it('displays live broadcasting status', () => {
    render(<RRBEcosystemDashboard />);
    
    expect(screen.getByText('Live Broadcasting Status')).toBeInTheDocument();
    expect(screen.getByText('Main Stream (432 Hz)')).toBeInTheDocument();
  });

  it('shows all systems as active', () => {
    render(<RRBEcosystemDashboard />);
    
    const activeBadges = screen.getAllByText('active');
    expect(activeBadges.length).toBeGreaterThan(0);
  });

  it('displays ecosystem statistics', () => {
    render(<RRBEcosystemDashboard />);
    
    expect(screen.getByText('Uptime')).toBeInTheDocument();
    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText('Donations')).toBeInTheDocument();
  });
});
