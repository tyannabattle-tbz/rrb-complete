import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, FileJson, FileText, File } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatExportPage() {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'markdown'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export
      const mockData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        sessions: [
          {
            id: 'session-1',
            title: 'Sample Chat',
            messages: [
              { role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
              { role: 'assistant', content: 'Hi there!', timestamp: new Date().toISOString() },
            ],
          },
        ],
      };

      let content = '';
      let filename = '';
      let mimeType = 'text/plain';

      if (exportFormat === 'json') {
        content = JSON.stringify(mockData, null, 2);
        filename = `chats-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else if (exportFormat === 'csv') {
        content = 'Session ID,Title,Role,Content,Timestamp\n';
        mockData.sessions.forEach((session) => {
          session.messages.forEach((msg) => {
            content += `${session.id},"${session.title}",${msg.role},"${msg.content}",${msg.timestamp}\n`;
          });
        });
        filename = `chats-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        content = `# Chat Export\n\n**Exported:** ${new Date().toISOString()}\n\n`;
        mockData.sessions.forEach((session) => {
          content += `## ${session.title}\n\n`;
          session.messages.forEach((msg) => {
            content += `**${msg.role}:** ${msg.content}\n\n`;
          });
        });
        filename = `chats-${new Date().toISOString().split('T')[0]}.md`;
        mimeType = 'text/markdown';
      }

      // Create blob and download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Chats exported as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export chats');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const content = await file.text();
      const data = JSON.parse(content);

      if (!data.sessions || !Array.isArray(data.sessions)) {
        throw new Error('Invalid file format');
      }

      toast.success(`Imported ${data.sessions.length} chat session(s)`);
    } catch (error) {
      toast.error('Failed to import chats. Please ensure the file is valid JSON.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Chat Export & Import</h1>
        <p className="text-slate-600 mt-2">
          Export your chat history in multiple formats or import chats from backup files.
        </p>
      </div>

      {/* Export Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Chats
          </CardTitle>
          <CardDescription>Download your chat history in your preferred format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'json' as const, label: 'JSON', icon: FileJson, desc: 'Structured data format' },
                { value: 'csv' as const, label: 'CSV', icon: File, desc: 'Spreadsheet compatible' },
                { value: 'markdown' as const, label: 'Markdown', icon: FileText, desc: 'Human readable' },
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setExportFormat(format.value)}
                  className={`p-4 rounded-lg border-2 transition ${
                    exportFormat === format.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <format.icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium text-sm">{format.label}</p>
                  <p className="text-xs text-slate-600">{format.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Chats'}
          </Button>

          {/* Format Info */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">
              {exportFormat === 'json' &&
                '📋 JSON format preserves all metadata and is ideal for backups and data portability.'}
              {exportFormat === 'csv' &&
                '📊 CSV format is compatible with Excel and other spreadsheet applications.'}
              {exportFormat === 'markdown' &&
                '📝 Markdown format is human-readable and great for documentation and sharing.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Chats
          </CardTitle>
          <CardDescription>Restore chats from a previously exported backup file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-slate-400" />
                <p className="font-medium text-slate-900">
                  {isImporting ? 'Importing...' : 'Click to select JSON file'}
                </p>
                <p className="text-sm text-slate-600">or drag and drop</p>
              </div>
            </label>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> Only JSON files exported from Qumus can be imported. Make sure you have
              the correct backup file.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card className="shadow-lg bg-slate-50">
        <CardHeader>
          <CardTitle>Export Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600">Total Sessions</p>
              <p className="text-2xl font-bold text-slate-900">12</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Messages</p>
              <p className="text-2xl font-bold text-slate-900">487</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Export Size</p>
              <p className="text-2xl font-bold text-slate-900">2.4 MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
