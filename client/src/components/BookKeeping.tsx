import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Archive, Download, Search, Filter, Play, Trash2, Tag, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface BroadcastRecord {
  id: string;
  title: string;
  date: string;
  duration: number;
  fileSize: string;
  tags: string[];
  status: 'archived' | 'active' | 'deleted';
  recordedAt: number;
}

export function BookKeeping() {
  const [records, setRecords] = useState<BroadcastRecord[]>([
    {
      id: '1',
      title: 'Morning News - Feb 7',
      date: '2026-02-07',
      duration: 30,
      fileSize: '45 MB',
      tags: ['news', 'morning'],
      status: 'archived',
      recordedAt: Date.now() - 86400000,
    },
    {
      id: '2',
      title: 'Evening Talk Show - Feb 7',
      date: '2026-02-07',
      duration: 60,
      fileSize: '89 MB',
      tags: ['talk', 'evening'],
      status: 'archived',
      recordedAt: Date.now() - 86400000,
    },
    {
      id: '3',
      title: 'Music Program - Feb 6',
      date: '2026-02-06',
      duration: 120,
      fileSize: '178 MB',
      tags: ['music', 'entertainment'],
      status: 'archived',
      recordedAt: Date.now() - 172800000,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const allTags = Array.from(new Set(records.flatMap(r => r.tags)));

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || record.tags.includes(selectedTag);
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesTag && matchesStatus;
  });

  const downloadRecord = (id: string) => {
    const record = records.find(r => r.id === id);
    if (record) {
      toast.success(`Downloading: ${record.title}`);
    }
  };

  const deleteRecord = (id: string) => {
    setRecords(records.map(r => 
      r.id === id ? { ...r, status: 'deleted' as const } : r
    ));
    toast.success('Record marked as deleted');
  };

  const archiveRecord = (id: string) => {
    setRecords(records.map(r => 
      r.id === id ? { ...r, status: 'archived' as const } : r
    ));
    toast.success('Record archived');
  };

  const totalSize = records.reduce((sum, r) => sum + parseInt(r.fileSize), 0);
  const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Broadcast Archive & Records</h2>
        <p className="text-slate-400">Manage and retrieve broadcast recordings</p>
      </div>

      {/* Search & Filter */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search broadcasts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button variant="outline" className="border-slate-600 gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setFilterStatus('all')}
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              className="border-slate-600"
            >
              All
            </Button>
            <Button
              onClick={() => setFilterStatus('archived')}
              variant={filterStatus === 'archived' ? 'default' : 'outline'}
              size="sm"
              className="border-slate-600"
            >
              Archived
            </Button>
            <Button
              onClick={() => setFilterStatus('active')}
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              className="border-slate-600"
            >
              Active
            </Button>
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Total Records</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{records.length}</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Total Duration</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">{Math.floor(totalDuration / 60)}h</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Storage Used</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{totalSize} MB</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Archived</p>
          <p className="text-3xl font-bold text-orange-400 mt-2">{records.filter(r => r.status === 'archived').length}</p>
        </Card>
      </div>

      {/* Records List */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Broadcast Records</h3>
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No records found</p>
          ) : (
            filteredRecords.map(record => (
              <div key={record.id} className="bg-slate-700 rounded p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-white">{record.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      record.status === 'archived' ? 'bg-blue-600/20 text-blue-300' :
                      record.status === 'active' ? 'bg-green-600/20 text-green-300' :
                      'bg-red-600/20 text-red-300'
                    }`}>
                      {record.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                    <span>{record.duration}m</span>
                    <span>{record.fileSize}</span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {record.tags.map(tag => (
                      <span key={tag} className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-slate-600 gap-1">
                    <Play className="w-4 h-4" />
                    Play
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => downloadRecord(record.id)}
                    variant="outline"
                    className="border-slate-600 gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => archiveRecord(record.id)}
                    variant="outline"
                    className="border-slate-600 gap-1"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => deleteRecord(record.id)}
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600/20 gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
