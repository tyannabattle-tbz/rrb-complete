import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

interface Policy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'testing';
  priority: 'low' | 'medium' | 'high';
  autonomyLevel: number;
  lastModified: string;
}

export default function PoliciesControlPage() {
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: '1',
      name: 'Content Scheduling Policy',
      description: 'Automatically schedules content across all platforms',
      status: 'active',
      priority: 'high',
      autonomyLevel: 90,
      lastModified: '2026-03-04',
    },
    {
      id: '2',
      name: 'Listener Engagement Policy',
      description: 'Monitors and responds to listener engagement metrics',
      status: 'active',
      priority: 'high',
      autonomyLevel: 85,
      lastModified: '2026-03-03',
    },
    {
      id: '3',
      name: 'Emergency Alert Policy',
      description: 'Handles emergency broadcasts and alerts',
      status: 'active',
      priority: 'high',
      autonomyLevel: 95,
      lastModified: '2026-03-02',
    },
    {
      id: '4',
      name: 'Resource Optimization Policy',
      description: 'Optimizes system resources and bandwidth',
      status: 'active',
      priority: 'medium',
      autonomyLevel: 80,
      lastModified: '2026-03-01',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'testing'>('all');
  const [showNewPolicy, setShowNewPolicy] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ name: '', description: '', priority: 'medium' });

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || policy.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddPolicy = () => {
    if (newPolicy.name.trim()) {
      const policy: Policy = {
        id: Date.now().toString(),
        name: newPolicy.name,
        description: newPolicy.description,
        status: 'testing',
        priority: newPolicy.priority as 'low' | 'medium' | 'high',
        autonomyLevel: 50,
        lastModified: new Date().toISOString().split('T')[0],
      };
      setPolicies([...policies, policy]);
      setNewPolicy({ name: '', description: '', priority: 'medium' });
      setShowNewPolicy(false);
    }
  };

  const handleDeletePolicy = (id: string) => {
    setPolicies(policies.filter(p => p.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setPolicies(policies.map(p => 
      p.id === id 
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl font-bold text-white">Policy Management</h1>
        </div>
        <p className="text-purple-300">Configure and manage QUMUS autonomous decision policies</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
          <Input
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        <div className="flex gap-2">
          <Filter className="w-5 h-5 text-purple-400 mt-3" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
          >
            <option value="all">All Policies</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="testing">Testing</option>
          </select>
        </div>

        <Button
          onClick={() => setShowNewPolicy(!showNewPolicy)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Policy
        </Button>
      </div>

      {/* New Policy Form */}
      {showNewPolicy && (
        <Card className="bg-slate-800/50 border-purple-500/20 mb-8">
          <CardHeader>
            <CardTitle>Create New Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300">Policy Name</label>
              <Input
                value={newPolicy.name}
                onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                placeholder="e.g., Auto-Moderation Policy"
                className="mt-2 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Description</label>
              <Textarea
                value={newPolicy.description}
                onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                placeholder="Describe what this policy does..."
                className="mt-2 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Priority</label>
              <select
                value={newPolicy.priority}
                onChange={(e) => setNewPolicy({ ...newPolicy, priority: e.target.value })}
                className="mt-2 w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddPolicy}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Create Policy
              </Button>
              <Button
                onClick={() => setShowNewPolicy(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPolicies.map((policy) => (
          <Card
            key={policy.id}
            className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all"
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <CardTitle className="text-xl text-white">{policy.name}</CardTitle>
                  <CardDescription className="text-purple-300 mt-1">
                    {policy.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge
                    className={`${
                      policy.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : policy.status === 'testing'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {policy.status}
                  </Badge>
                  <Badge
                    className={`${
                      policy.priority === 'high'
                        ? 'bg-red-500/20 text-red-400'
                        : policy.priority === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {policy.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Autonomy Level</span>
                  <span className="text-sm font-semibold text-purple-400">{policy.autonomyLevel}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                    style={{ width: `${policy.autonomyLevel}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Last modified: {policy.lastModified}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleToggleStatus(policy.id)}
                  className={`flex-1 ${
                    policy.status === 'active'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {policy.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDeletePolicy(policy.id)}
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-400 hover:bg-red-600/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-slate-400">No policies found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
