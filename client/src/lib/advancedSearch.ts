import { create } from 'zustand';

export interface SearchFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  severity?: 'low' | 'medium' | 'high' | 'critical';
  channels?: string[];
  status?: 'pending' | 'sent' | 'delivered' | 'failed';
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  severity: string;
  channels: string[];
  status: string;
  createdAt: Date;
  relevance: number;
}

interface SearchStore {
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
  isSearching: boolean;
  
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  search: (query: string, filters?: SearchFilters) => Promise<SearchResult[]>;
  clearSearch: () => void;
}

// Mock data for demonstration
const mockBroadcasts: SearchResult[] = [
  {
    id: '1',
    title: 'Emergency Alert - Severe Weather',
    content: 'Severe thunderstorm warning for the region',
    severity: 'critical',
    channels: ['SMS', 'Email', 'Push'],
    status: 'delivered',
    createdAt: new Date('2026-02-06'),
    relevance: 0.95,
  },
  {
    id: '2',
    title: 'System Maintenance Notice',
    content: 'Scheduled maintenance on February 7th',
    severity: 'medium',
    channels: ['Email', 'Push'],
    status: 'sent',
    createdAt: new Date('2026-02-05'),
    relevance: 0.85,
  },
  {
    id: '3',
    title: 'Community Update',
    content: 'New features available in HybridCast',
    severity: 'low',
    channels: ['Push'],
    status: 'delivered',
    createdAt: new Date('2026-02-04'),
    relevance: 0.75,
  },
];

function matchesFilters(broadcast: SearchResult, filters: SearchFilters): boolean {
  if (filters.dateRange) {
    if (broadcast.createdAt < filters.dateRange.start || broadcast.createdAt > filters.dateRange.end) {
      return false;
    }
  }
  
  if (filters.severity && broadcast.severity !== filters.severity) {
    return false;
  }
  
  if (filters.channels && filters.channels.length > 0) {
    const hasChannel = filters.channels.some(ch => broadcast.channels.includes(ch));
    if (!hasChannel) return false;
  }
  
  if (filters.status && broadcast.status !== filters.status) {
    return false;
  }
  
  return true;
}

function calculateRelevance(query: string, broadcast: SearchResult): number {
  const queryLower = query.toLowerCase();
  let score = 0;
  
  // Title match (highest weight)
  if (broadcast.title.toLowerCase().includes(queryLower)) {
    score += 0.5;
  }
  
  // Content match
  if (broadcast.content.toLowerCase().includes(queryLower)) {
    score += 0.3;
  }
  
  // Exact match bonus
  if (broadcast.title.toLowerCase() === queryLower) {
    score += 0.2;
  }
  
  return Math.min(score, 1);
}

export const useAdvancedSearch = create<SearchStore>((set) => ({
  query: '',
  filters: {},
  results: [],
  isSearching: false,
  
  setQuery: (query: string) => set({ query }),
  
  setFilters: (filters: SearchFilters) => set({ filters }),
  
  search: async (query: string, filters?: SearchFilters) => {
    set({ isSearching: true });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const searchFilters = filters || {};
    
    let results = mockBroadcasts.filter(broadcast => {
      // Text search
      if (query) {
        const relevance = calculateRelevance(query, broadcast);
        if (relevance === 0) return false;
        broadcast.relevance = relevance;
      }
      
      // Filter matching
      return matchesFilters(broadcast, searchFilters);
    });
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    set({ results, isSearching: false });
    return results;
  },
  
  clearSearch: () => set({ query: '', filters: {}, results: [], isSearching: false }),
}));

export const severityLevels = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'critical', label: 'Critical', color: '#7c3aed' },
];

export const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
];

export const channelOptions = [
  { value: 'SMS', label: 'SMS' },
  { value: 'Email', label: 'Email' },
  { value: 'Push', label: 'Push Notification' },
  { value: 'Voice', label: 'Voice Call' },
  { value: 'Siren', label: 'Siren' },
];
