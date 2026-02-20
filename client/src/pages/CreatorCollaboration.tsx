import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  MessageSquare,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Share2,
  Eye,
  ThumbsUp,
  MessageCircle,
  Send,
  Lock,
  Unlock,
  GitBranch,
  Zap,
  Award,
  TrendingUp,
} from 'lucide-react';

interface CollaborationProject {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'published';
  creators: CollaboratorProfile[];
  createdDate: string;
  dueDate: string;
  progress: number;
  comments: number;
  approvals: number;
}

interface CollaboratorProfile {
  id: string;
  name: string;
  role: 'owner' | 'editor' | 'reviewer' | 'contributor';
  avatar?: string;
  joinedDate: string;
  status: 'active' | 'idle' | 'offline';
}

interface ContentComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  approved: boolean;
  replies: ContentComment[];
}

const SAMPLE_PROJECTS: CollaborationProject[] = [
  {
    id: 'proj_1',
    title: 'Weekly Music Showcase - Episode 42',
    description: 'Collaborative broadcast featuring emerging artists and special guests',
    status: 'in-progress',
    creators: [
      { id: 'u1', name: 'Alex Producer', role: 'owner', status: 'active', joinedDate: '2026-02-01' },
      { id: 'u2', name: 'Jordan Editor', role: 'editor', status: 'active', joinedDate: '2026-02-05' },
      { id: 'u3', name: 'Casey Reviewer', role: 'reviewer', status: 'idle', joinedDate: '2026-02-10' },
    ],
    createdDate: '2026-02-15',
    dueDate: '2026-02-22',
    progress: 75,
    comments: 12,
    approvals: 1,
  },
  {
    id: 'proj_2',
    title: 'Community Wellness Series',
    description: 'Multi-part series on mental health and wellness',
    status: 'review',
    creators: [
      { id: 'u4', name: 'Morgan Host', role: 'owner', status: 'active', joinedDate: '2026-01-20' },
      { id: 'u5', name: 'Taylor Producer', role: 'editor', status: 'active', joinedDate: '2026-02-01' },
      { id: 'u6', name: 'Riley Contributor', role: 'contributor', status: 'offline', joinedDate: '2026-02-08' },
    ],
    createdDate: '2026-02-01',
    dueDate: '2026-02-25',
    progress: 95,
    comments: 28,
    approvals: 2,
  },
  {
    id: 'proj_3',
    title: 'Gaming Tournament Live Stream',
    description: 'Solbones tournament broadcast with commentary and analysis',
    status: 'planning',
    creators: [
      { id: 'u7', name: 'Sam Streamer', role: 'owner', status: 'active', joinedDate: '2026-02-10' },
      { id: 'u8', name: 'Alex Commentator', role: 'contributor', status: 'active', joinedDate: '2026-02-12' },
    ],
    createdDate: '2026-02-18',
    dueDate: '2026-03-01',
    progress: 30,
    comments: 5,
    approvals: 0,
  },
];

export function CreatorCollaboration() {
  const [activeTab, setActiveTab] = useState<'projects' | 'collaboration' | 'workflow'>('projects');
  const [selectedProject, setSelectedProject] = useState<CollaborationProject | null>(null);
  const [newComment, setNewComment] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Users className="w-8 h-8 text-purple-500" /> Creator Collaboration
            </h1>
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            {[
              { id: 'projects', label: 'Projects' },
              { id: 'collaboration', label: 'Team Collaboration' },
              { id: 'workflow', label: 'Workflow' },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Project List */}
            <div className="space-y-3">
              {SAMPLE_PROJECTS.map((project) => (
                <Card
                  key={project.id}
                  className="bg-gray-800 border-gray-700 p-4 hover:bg-gray-750 transition cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{project.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded font-semibold ${
                            project.status === 'published'
                              ? 'bg-green-900 text-green-200'
                              : project.status === 'review'
                              ? 'bg-yellow-900 text-yellow-200'
                              : project.status === 'in-progress'
                              ? 'bg-blue-900 text-blue-200'
                              : 'bg-gray-700 text-gray-200'
                          }`}
                        >
                          {project.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{project.description}</p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400 text-xs">Progress</span>
                          <span className="text-white font-semibold text-xs">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> {project.creators.length} creators
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" /> {project.comments} comments
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> {project.approvals} approvals
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> Due {project.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Collaborator Avatars */}
                    <div className="flex -space-x-2">
                      {project.creators.slice(0, 3).map((creator) => (
                        <div
                          key={creator.id}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-gray-900"
                          title={creator.name}
                        >
                          {creator.name.charAt(0)}
                        </div>
                      ))}
                      {project.creators.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-gray-300">
                          +{project.creators.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Project Details */}
            {selectedProject && (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedProject.title}</h2>
                    <p className="text-gray-400 mt-2">{selectedProject.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)}>
                    ✕
                  </Button>
                </div>

                {/* Tabs for Details */}
                <div className="space-y-6">
                  {/* Team Members */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Team Members</h3>
                    <div className="space-y-2">
                      {selectedProject.creators.map((creator) => (
                        <div
                          key={creator.id}
                          className="p-3 bg-gray-700 rounded border border-gray-600 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center font-bold text-gray-900">
                              {creator.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-semibold">{creator.name}</p>
                              <p className="text-gray-400 text-xs">
                                {creator.role} • {creator.status}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              creator.status === 'active'
                                ? 'bg-green-900 text-green-200'
                                : creator.status === 'idle'
                                ? 'bg-yellow-900 text-yellow-200'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {creator.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Comments & Feedback</h3>
                    <div className="space-y-3 mb-4">
                      {[
                        {
                          author: 'Alex Producer',
                          text: 'Great progress! Can we add more transitions between segments?',
                          timestamp: '2 hours ago',
                        },
                        {
                          author: 'Casey Reviewer',
                          text: 'Love the music selection. Approved for next stage.',
                          timestamp: '1 hour ago',
                        },
                      ].map((comment, idx) => (
                        <div key={`item-${idx}`} className="p-3 bg-gray-700 rounded border border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-semibold text-sm">{comment.author}</p>
                            <span className="text-gray-400 text-xs">{comment.timestamp}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm"
                      />
                      <Button size="sm" className="gap-1">
                        <Send className="w-4 h-4" /> Post
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Collaboration Tab */}
        {activeTab === 'collaboration' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Collaborations</p>
                    <p className="text-3xl font-bold text-blue-400 mt-2">3</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Team Members</p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">8</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending Approvals</p>
                    <p className="text-3xl font-bold text-orange-400 mt-2">2</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Collaboration Features</h3>
              <div className="space-y-3">
                {[
                  { icon: Edit2, title: 'Real-time Editing', desc: 'Collaborate on content simultaneously' },
                  { icon: MessageCircle, title: 'Inline Comments', desc: 'Add feedback directly to content' },
                  { icon: GitBranch, title: 'Version Control', desc: 'Track all changes and revisions' },
                  { icon: Lock, title: 'Permission Control', desc: 'Manage who can edit, view, or approve' },
                  { icon: CheckCircle, title: 'Approval Workflow', desc: 'Multi-stage review and approval' },
                  { icon: Zap, title: 'Real-time Sync', desc: 'Instant updates across all collaborators' },
                ].map((feature, idx) => (
                  <div key={`item-${idx}`} className="p-4 bg-gray-700 rounded border border-gray-600 flex items-start gap-3">
                    <feature.icon className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold">{feature.title}</p>
                      <p className="text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Collaboration Workflow</h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Create Project',
                    desc: 'Define project scope, goals, and timeline',
                    status: 'completed',
                  },
                  {
                    step: 2,
                    title: 'Invite Collaborators',
                    desc: 'Add team members with specific roles',
                    status: 'completed',
                  },
                  {
                    step: 3,
                    title: 'Content Development',
                    desc: 'Create and edit content collaboratively',
                    status: 'in-progress',
                  },
                  {
                    step: 4,
                    title: 'Review & Feedback',
                    desc: 'Gather feedback from reviewers',
                    status: 'pending',
                  },
                  {
                    step: 5,
                    title: 'Approval',
                    desc: 'Get final approval from stakeholders',
                    status: 'pending',
                  },
                  {
                    step: 6,
                    title: 'Publish',
                    desc: 'Release content to audience',
                    status: 'pending',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          item.status === 'completed'
                            ? 'bg-green-900 text-green-200'
                            : item.status === 'in-progress'
                            ? 'bg-blue-900 text-blue-200'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {item.status === 'completed' ? '✓' : item.step}
                      </div>
                      {item.step < 6 && <div className="w-1 h-12 bg-gray-700 mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="text-white font-semibold">{item.title}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
