import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Plus,
  Trash2,
  Edit2,
  Copy,
  Eye,
  ArrowLeft,
  Save,
  X,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface BroadcastTemplate {
  id: string;
  name: string;
  title: string;
  content: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export default function BroadcastTemplatesLibrary() {
  const [, navigate] = useLocation();
  const [templates, setTemplates] = useState<BroadcastTemplate[]>([
    {
      id: '1',
      name: 'System Maintenance',
      title: 'Scheduled System Maintenance',
      content:
        'The system will undergo scheduled maintenance from 2:00 AM to 4:00 AM EST. Services will be unavailable during this time.',
      severity: 'medium',
      channels: ['email', 'sms', 'push'],
      tags: ['maintenance', 'scheduled'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      usageCount: 12,
    },
    {
      id: '2',
      name: 'Security Alert',
      title: 'Security Incident Detected',
      content:
        'A potential security incident has been detected. Please review your account activity and change your password if necessary.',
      severity: 'high',
      channels: ['email', 'push', 'in-app'],
      tags: ['security', 'alert'],
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      usageCount: 5,
    },
    {
      id: '3',
      name: 'Emergency Alert',
      title: 'Emergency Alert - Take Action Now',
      content:
        'This is an emergency alert. Please follow the instructions provided by local authorities immediately.',
      severity: 'critical',
      channels: ['sms', 'push', 'in-app'],
      tags: ['emergency', 'critical'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      usageCount: 2,
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BroadcastTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<BroadcastTemplate>>({
    severity: 'medium',
    channels: [],
    tags: [],
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.title || !newTemplate.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const template: BroadcastTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name || '',
      title: newTemplate.title || '',
      content: newTemplate.content || '',
      severity: newTemplate.severity as any,
      channels: newTemplate.channels || [],
      tags: newTemplate.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
    };

    setTemplates([...templates, template]);
    setNewTemplate({ severity: 'medium', channels: [], tags: [] });
    setShowCreateDialog(false);
    toast.success('Template created successfully');
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
    toast.success('Template deleted');
  };

  const handleDuplicateTemplate = (template: BroadcastTemplate) => {
    const duplicated: BroadcastTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
    };
    setTemplates([...templates, duplicated]);
    toast.success('Template duplicated');
  };

  const handleUseTemplate = (template: BroadcastTemplate) => {
    toast.success(`Using template: ${template.name}`);
    // In a real app, this would navigate to broadcast creation with template data
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Broadcast Templates</h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage reusable broadcast templates for faster emergency response
              </p>
            </div>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Template</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Template Name
                  </label>
                  <Input
                    placeholder="e.g., System Maintenance"
                    value={newTemplate.name || ''}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Broadcast Title
                  </label>
                  <Input
                    placeholder="Title shown in broadcast"
                    value={newTemplate.title || ''}
                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Content
                  </label>
                  <textarea
                    placeholder="Broadcast message content"
                    value={newTemplate.content || ''}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    className="w-full h-24 bg-slate-700 border border-slate-600 rounded text-white p-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Severity
                  </label>
                  <select
                    value={newTemplate.severity || 'medium'}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        severity: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded text-white p-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateTemplate}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                  <Button
                    onClick={() => setShowCreateDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Total Templates</div>
            <div className="text-2xl font-bold text-white">{templates.length}</div>
          </Card>
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Critical</div>
            <div className="text-2xl font-bold text-red-400">
              {templates.filter((t) => t.severity === 'critical').length}
            </div>
          </Card>
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Total Uses</div>
            <div className="text-2xl font-bold text-cyan-400">
              {templates.reduce((sum, t) => sum + t.usageCount, 0)}
            </div>
          </Card>
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Most Used</div>
            <div className="text-lg font-bold text-blue-400">
              {templates.length > 0
                ? templates.reduce((max, t) => (t.usageCount > max.usageCount ? t : max))
                    .name
                : 'N/A'}
            </div>
          </Card>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="p-6 bg-slate-800 border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{template.title}</p>
                </div>
                <Badge className={getSeverityColor(template.severity)}>
                  {template.severity}
                </Badge>
              </div>

              <p className="text-sm text-slate-300 mb-4 line-clamp-2">{template.content}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {template.channels.map((channel) => (
                  <Badge key={channel} variant="outline" className="text-xs">
                    {channel}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <Clock className="w-3 h-3" />
                <span>Used {template.usageCount} times</span>
              </div>

              <div className="flex gap-2">
                <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setSelectedTemplate(template)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  {selectedTemplate?.id === template.id && (
                    <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Template Preview</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-slate-400">Title</label>
                          <p className="text-white font-semibold">{selectedTemplate.title}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Content</label>
                          <p className="text-slate-300 whitespace-pre-wrap">
                            {selectedTemplate.content}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Channels</label>
                          <div className="flex gap-2 flex-wrap">
                            {selectedTemplate.channels.map((ch) => (
                              <Badge key={ch}>{ch}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>

                <Button
                  onClick={() => handleUseTemplate(template)}
                  size="sm"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  Use Template
                </Button>

                <Button
                  onClick={() => handleDuplicateTemplate(template)}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="w-3 h-3" />
                </Button>

                <Button
                  onClick={() => handleDeleteTemplate(template.id)}
                  size="sm"
                  variant="outline"
                  className="text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <Card className="p-12 bg-slate-800 border-slate-700 text-center">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No Templates</h3>
            <p className="text-slate-500 mb-4">Create your first broadcast template to get started.</p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
