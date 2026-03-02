import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PortAwareRouter } from '../PortAwareRouter';

// Mock components for testing
const QumusComponent = () => <div>Qumus System</div>;
const RRBComponent = () => <div>RRB Radio Station</div>;
const HybridCastComponent = () => <div>HybridCast Emergency</div>;

describe('PortAwareRouter', () => {
  beforeEach(() => {
    // Reset window.location mock before each test
    delete (window as any).location;
    (window as any).location = { hostname: 'localhost', port: '', protocol: 'http:' };
  });

  it('should route to Qumus for qumus.rockinrockinboogie.com', async () => {
    (window as any).location.hostname = 'qumus.rockinrockinboogie.com';
    
    render(
      <PortAwareRouter
        qumusComponent={QumusComponent}
        rrbComponent={RRBComponent}
        hybridcastComponent={HybridCastComponent}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Qumus System')).toBeInTheDocument();
    });
  });

  it('should route to RRB for rockinrockinboogie.com', async () => {
    (window as any).location.hostname = 'rockinrockinboogie.com';
    
    render(
      <PortAwareRouter
        qumusComponent={QumusComponent}
        rrbComponent={RRBComponent}
        hybridcastComponent={HybridCastComponent}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('RRB Radio Station')).toBeInTheDocument();
    });
  });

  it('should route to RRB for www.rockinrockinboogie.com', async () => {
    (window as any).location.hostname = 'www.rockinrockinboogie.com';
    
    render(
      <PortAwareRouter
        qumusComponent={QumusComponent}
        rrbComponent={RRBComponent}
        hybridcastComponent={HybridCastComponent}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('RRB Radio Station')).toBeInTheDocument();
    });
  });

  it('should route to HybridCast for hybridcast.rockinrockinboogie.com', async () => {
    (window as any).location.hostname = 'hybridcast.rockinrockinboogie.com';
    
    render(
      <PortAwareRouter
        qumusComponent={QumusComponent}
        rrbComponent={RRBComponent}
        hybridcastComponent={HybridCastComponent}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('HybridCast Emergency')).toBeInTheDocument();
    });
  });

  it('should route to RRB for port 3001', async () => {
    (window as any).location.hostname = 'localhost';
    (window as any).location.port = '3001';
    
    render(
      <PortAwareRouter
        qumusComponent={QumusComponent}
        rrbComponent={RRBComponent}
        hybridcastComponent={HybridCastComponent}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('RRB Radio Station')).toBeInTheDocument();
    });
  });

  it('should route to Qumus for port 3000', async () => {
    (window as any).location.hostname = 'localhost';
    (window as any).location.port = '3000';
    
    render(
      <PortAwareRouter
        qumusComponent={QumusComponent}
        rrbComponent={RRBComponent}
        hybridcastComponent={HybridCastComponent}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Qumus System')).toBeInTheDocument();
    });
  });

  it('should route to HybridCast for port 3002', async () => {
    (window as any).location.hostname = 'localhost';
    (window as any).location.port = '3002';
    
    render(
      <PortAwareRouter
        qumusComponent={QumusComponent}
        rrbComponent={RRBComponent}
        hybridcastComponent={HybridCastComponent}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('HybridCast Emergency')).toBeInTheDocument();
    });
  });

  it('should default to Qumus for unknown hostnames', async () => {
    (window as any).location.hostname = 'unknown.example.com';
    
    render(
      <PortAwareRouter
        qumusComponent={QumusComponent}
        rrbComponent={RRBComponent}
        hybridcastComponent={HybridCastComponent}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Qumus System')).toBeInTheDocument();
    });
  });

  it('should eventually render the correct system component', async () => {
    (window as any).location.hostname = 'qumus.rockinrockinboogie.com';
    
    render(
      <PortAwareRouter
        qumusComponent={QumusComponent}
        rrbComponent={RRBComponent}
        hybridcastComponent={HybridCastComponent}
      />
    );

    // Component should render after loading completes
    await waitFor(() => {
      expect(screen.getByText('Qumus System')).toBeInTheDocument();
    });
  });

});
