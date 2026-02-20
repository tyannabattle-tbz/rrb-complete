/**
 * Commercial Upload Admin UI
 * 
 * Allows admins to:
 * - Upload single or batch commercial MP3 files
 * - Preview commercials
 * - Set rotation rules
 * - Track performance metrics
 * - Manage commercial schedules
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Upload, Play, Trash2, Settings, BarChart3, Clock } from 'lucide-react';

export default function CommercialUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    duration: number;
    uploadedAt: string;
    status: 'uploaded' | 'processing' | 'active';
  }>>([]);

  const [dragActive, setDragActive] = useState(false);

  const commercials = [
    {
      id: 'rrbid_001',
      title: 'RRB Radio Station ID',
      duration: 30,
      plays: 1240,
      engagement: 89,
      completionRate: 92,
      uploadedBy: 'Admin',
      uploadedAt: '2026-02-15',
      status: 'active',
    },
    {
      id: 'annas_001',
      title: "Anna's Promotions",
      duration: 45,
      plays: 342,
      engagement: 76,
      completionRate: 84,
      uploadedBy: 'Admin',
      uploadedAt: '2026-02-16',
      status: 'active',
    },
    {
      id: 'sweetmiracles_001',
      title: 'Sweet Miracles PSA',
      duration: 60,
      plays: 856,
      engagement: 82,
      completionRate: 88,
      uploadedBy: 'Admin',
      uploadedAt: '2026-02-14',
      status: 'active',
    },
    {
      id: 'littlec_001',
      title: 'Little C Commercial',
      duration: 30,
      plays: 298,
      engagement: 71,
      completionRate: 79,
      uploadedBy: 'Admin',
      uploadedAt: '2026-02-17',
      status: 'active',
    },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'audio/mpeg' || file.type === 'audio/mp3') {
        const newFile = {
          id: `upload_${Date.now()}_${i}`,
          name: file.name,
          size: file.size,
          duration: Math.floor(Math.random() * 60) + 15, // Mock duration
          uploadedAt: new Date().toLocaleString(),
          status: 'processing' as const,
        };
        setUploadedFiles([...uploadedFiles, newFile]);

        // Simulate upload completion
        setTimeout(() => {
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === newFile.id ? { ...f, status: 'active' as const } : f
            )
          );
        }, 2000);
      }
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Commercial Management</h1>
        <p className="text-muted-foreground">Upload, manage, and track commercial performance</p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="commercials">Commercials</TabsTrigger>
          <TabsTrigger value="rotation">Rotation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Commercial MP3</CardTitle>
              <CardDescription>Upload single or batch commercial files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">Drag and drop MP3 files here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <input
                  type="file"
                  multiple
                  accept=".mp3,audio/mpeg"
                  onChange={handleChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input">
                  <Button asChild variant="outline">
                    <span>Select Files</span>
                  </Button>
                </label>
              </div>

              {/* Recently Uploaded */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Recent Uploads</h3>
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.duration}s
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={file.status === 'active' ? 'default' : 'secondary'}
                        >
                          {file.status === 'processing' ? 'Processing...' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commercials Tab */}
        <TabsContent value="commercials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Commercials</CardTitle>
              <CardDescription>Manage and monitor all commercials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commercials.map(commercial => (
                  <div key={commercial.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold">{commercial.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          ID: {commercial.id} • {commercial.duration}s • Uploaded {commercial.uploadedAt}
                        </p>
                      </div>
                      <Badge className="ml-2">Active</Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Plays</p>
                        <p className="font-bold">{commercial.plays.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-bold">{commercial.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completion</p>
                        <p className="font-bold">{commercial.completionRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-bold text-green-600">Live</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        Settings
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-1 text-red-600">
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rotation Tab */}
        <TabsContent value="rotation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commercial Rotation Rules</CardTitle>
              <CardDescription>Configure how commercials rotate across channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Rotation Strategy</h4>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Every 30 minutes, rotate through active commercials. Station IDs play every 15 minutes.
                  </p>
                  <Button size="sm" variant="outline">Edit Rules</Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Channel Distribution</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>All 7 channels</span>
                      <span className="font-semibold">100%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Time-Based Rules</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Peak Hours (6am-10pm)</span>
                      <span className="font-semibold">Every 20 min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Off-Peak Hours (10pm-6am)</span>
                      <span className="font-semibold">Every 40 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commercial Performance Analytics</CardTitle>
              <CardDescription>Track metrics and optimize commercial strategy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-muted-foreground text-sm">Total Plays</p>
                  <p className="text-3xl font-bold">2,736</p>
                  <p className="text-xs text-green-600 mt-1">+12% from yesterday</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-muted-foreground text-sm">Avg Engagement</p>
                  <p className="text-3xl font-bold">79.5%</p>
                  <p className="text-xs text-green-600 mt-1">+3% from yesterday</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-muted-foreground text-sm">Avg Completion</p>
                  <p className="text-3xl font-bold">85.8%</p>
                  <p className="text-xs text-green-600 mt-1">+2% from yesterday</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Top Performing Commercials
                </h4>
                <div className="space-y-2">
                  {[
                    { name: 'RRB Radio Station ID', plays: 1240, engagement: 89 },
                    { name: 'Sweet Miracles PSA', plays: 856, engagement: 82 },
                    { name: "Anna's Promotions", plays: 342, engagement: 76 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{item.plays} plays</span>
                        <span className="font-semibold">{item.engagement}% engagement</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Peak Performance Times
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>7-9 AM (Morning Rush)</span>
                    <span className="font-semibold">92% engagement</span>
                  </div>
                  <div className="flex justify-between">
                    <span>12-1 PM (Lunch Break)</span>
                    <span className="font-semibold">85% engagement</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5-7 PM (Evening Drive)</span>
                    <span className="font-semibold">88% engagement</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
