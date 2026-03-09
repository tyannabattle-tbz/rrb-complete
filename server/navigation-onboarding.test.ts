import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Navigation & Onboarding System', () => {
  
  describe('DashboardLayout Sidebar', () => {
    const dashboardPath = path.join(__dirname, '../client/src/components/DashboardLayout.tsx');
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8');
    
    it('should have search input for filtering navigation', () => {
      expect(dashboardContent).toContain('searchQuery');
      expect(dashboardContent).toContain('setSearchQuery');
      expect(dashboardContent).toContain('placeholder="Search... (Ctrl+K)"');
    });
    
    it('should have collapsible sections with toggle functionality', () => {
      expect(dashboardContent).toContain('toggleSection');
      expect(dashboardContent).toContain('openSections');
      expect(dashboardContent).toContain('ChevronDown');
      expect(dashboardContent).toContain('ChevronRight');
    });
    
    it('should persist section state to localStorage', () => {
      expect(dashboardContent).toContain('SIDEBAR_SECTIONS_KEY');
      expect(dashboardContent).toContain('sidebar-sections');
      expect(dashboardContent).toContain('localStorage.setItem(SIDEBAR_SECTIONS_KEY');
      expect(dashboardContent).toContain('localStorage.getItem(SIDEBAR_SECTIONS_KEY');
    });
    
    it('should have keyboard shortcut Ctrl+K for search focus', () => {
      expect(dashboardContent).toContain('ctrlKey');
      expect(dashboardContent).toContain('metaKey');
      expect(dashboardContent).toContain('"k"');
      expect(dashboardContent).toContain('searchInputRef');
    });
    
    it('should have all 10 navigation sections', () => {
      const sections = [
        'Core', 'Broadcasting', 'Production Studio', 'Events & Community',
        'Sweet Miracles', 'Analytics', 'Legacy & Archive', 'Games & Explore',
        'Management', 'Admin'
      ];
      sections.forEach(section => {
        expect(dashboardContent).toContain(`title: "${section}"`);
      });
    });
    
    it('should have key navigation items for all major subsystems', () => {
      const keyItems = [
        'QUMUS Control', 'AI Chat', 'Ecosystem Dashboard', 'RRB Radio',
        'HybridCast', 'Studio Control Room', 'Convention Hub', 'Broadcast Hub',
        'Sweet Miracles', 'Listener Analytics', 'Canryn Production',
        'Webhook Manager', 'Ad Manager', 'Games Hub', 'Legacy', 'GPS Radar'
      ];
      keyItems.forEach(item => {
        expect(dashboardContent).toContain(item);
      });
    });
    
    it('should filter sections when search query is active', () => {
      expect(dashboardContent).toContain('filteredSections');
      expect(dashboardContent).toContain('searchQuery.toLowerCase()');
      expect(dashboardContent).toContain('item.label.toLowerCase().includes(q)');
    });
    
    it('should show no-results message when search yields nothing', () => {
      expect(dashboardContent).toContain('No pages found for');
      expect(dashboardContent).toContain('Clear search');
    });
    
    it('should have clear search button (X icon)', () => {
      expect(dashboardContent).toContain('onClick={() => setSearchQuery("")}');
    });
    
    it('should display item count per section', () => {
      expect(dashboardContent).toContain('section.items.length');
    });
  });
  
  describe('OnboardingTour Component', () => {
    const tourPath = path.join(__dirname, '../client/src/components/OnboardingTour.tsx');
    const tourContent = fs.readFileSync(tourPath, 'utf-8');
    
    it('should have 8 tour steps covering all major systems', () => {
      const steps = ['qumus', 'ai-chat', 'radio', 'studio', 'conventions', 'ecosystem', 'sweet-miracles', 'games'];
      steps.forEach(stepId => {
        expect(tourContent).toContain(`id: '${stepId}'`);
      });
    });
    
    it('should have navigation controls (next, prev, visit)', () => {
      expect(tourContent).toContain('handleNext');
      expect(tourContent).toContain('handlePrev');
      expect(tourContent).toContain('handleVisit');
    });
    
    it('should persist completion state to localStorage', () => {
      expect(tourContent).toContain('qumus-onboarding-completed');
      expect(tourContent).toContain('qumus-onboarding-dismissed');
      expect(tourContent).toContain('localStorage.setItem(TOUR_COMPLETED_KEY');
    });
    
    it('should have minimize functionality', () => {
      expect(tourContent).toContain('isMinimized');
      expect(tourContent).toContain('setIsMinimized');
    });
    
    it('should track completed steps', () => {
      expect(tourContent).toContain('completedSteps');
      expect(tourContent).toContain('setCompletedSteps');
      expect(tourContent).toContain('isStepCompleted');
    });
    
    it('should have progress bar', () => {
      expect(tourContent).toContain('progress');
      expect(tourContent).toContain('tourSteps.length');
    });
    
    it('should have step dots for direct navigation', () => {
      expect(tourContent).toContain('tourSteps.map');
      expect(tourContent).toContain('setCurrentStep(i)');
    });
    
    it('should export StartTourButton for restarting tour', () => {
      expect(tourContent).toContain('export function StartTourButton');
      expect(tourContent).toContain('Getting Started Tour');
    });
    
    it('should have correct paths for each tour step', () => {
      const pathMappings = [
        { id: 'qumus', path: '/qumus' },
        { id: 'ai-chat', path: '/qumus-chat' },
        { id: 'radio', path: '/rrb-radio' },
        { id: 'studio', path: '/studio' },
        { id: 'conventions', path: '/convention-hub' },
        { id: 'ecosystem', path: '/ecosystem-dashboard' },
        { id: 'sweet-miracles', path: '/donate' },
        { id: 'games', path: '/games' },
      ];
      pathMappings.forEach(({ path: p }) => {
        expect(tourContent).toContain(`path: '${p}'`);
      });
    });
    
    it('should have feature tags for each step', () => {
      const keyFeatures = [
        '13 Active Policies', '16 Subsystems', '90% Autonomous',
        'Valanna - Operations', 'Candy - Legacy', 'Seraph - Orchestrator',
        'Conference Mode', '41+ Channels', '6-Slot Live Panel',
        'Multi-Track Sessions', 'Breakout Rooms'
      ];
      keyFeatures.forEach(feature => {
        expect(tourContent).toContain(feature);
      });
    });
  });
  
  describe('SimplifiedMobileNav', () => {
    const mobilePath = path.join(__dirname, '../client/src/components/SimplifiedMobileNav.tsx');
    const mobileContent = fs.readFileSync(mobilePath, 'utf-8');
    
    it('should have 5 navigation sections', () => {
      const sections = ['Core', 'Media & Broadcasting', 'Events & Community', 'Play & Explore', 'Management'];
      sections.forEach(section => {
        expect(mobileContent).toContain(section);
      });
    });
    
    it('should include key navigation items', () => {
      const keyItems = [
        'QUMUS Control', 'AI Chat', 'RRB Radio', 'Production Studio',
        'Convention Hub', 'Sweet Miracles', 'Canryn Production', 'Analytics'
      ];
      keyItems.forEach(item => {
        expect(mobileContent).toContain(item);
      });
    });
  });
  
  describe('App.tsx Integration', () => {
    const appPath = path.join(__dirname, '../client/src/App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf-8');
    
    it('should import and render OnboardingTour', () => {
      expect(appContent).toContain("import { OnboardingTour } from '@/components/OnboardingTour'");
      expect(appContent).toContain('<OnboardingTour />');
    });
    
    it('should have all critical routes registered', () => {
      const criticalRoutes = [
        '/qumus', '/qumus-chat', '/rrb-radio', '/studio', '/convention-hub',
        '/ecosystem-dashboard', '/donate', '/games', '/hybridcast',
        '/broadcast-hub', '/listener-analytics', '/webhook-manager',
        '/ad-manager', '/canryn', '/settings'
      ];
      criticalRoutes.forEach(route => {
        expect(appContent).toContain(`path="${route}"`);
      });
    });
  });
});
