import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Trash2, Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: number;
  url?: string;
}

export default function DocumentUpload() {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Rockin Boogie Guidelines.pdf', size: 2.4, type: 'pdf', uploadedAt: Date.now() - 86400000 },
    { id: '2', name: 'HybridCast Manual.docx', size: 5.8, type: 'docx', uploadedAt: Date.now() - 172800000 },
  ]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const newDoc: Document = {
          id: `doc-${Date.now()}-${i}`,
          name: file.name,
          size: parseFloat((file.size / 1024 / 1024).toFixed(2)),
          type: file.name.split('.').pop() || 'unknown',
          uploadedAt: Date.now(),
        };
        setDocuments(prev => [...prev, newDoc]);
      }
      toast.success(`${files.length} document(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(docs => docs.filter(d => d.id !== id));
    toast.success('Document deleted');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFileIcon = (type: string) => {
    const icons: Record<string, string> = {
      pdf: '📄',
      docx: '📝',
      doc: '📝',
      txt: '📋',
      xlsx: '📊',
      csv: '📊',
      zip: '📦',
      mp3: '🎵',
      mp4: '🎬',
    };
    return icons[type.toLowerCase()] || '📎';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Upload className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Document Upload</h1>
          </div>
          <p className="text-slate-400">Upload and manage documents for Rockin Rockin Boogie</p>
        </div>

        {/* Upload Area */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardContent className="p-8">
            <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-slate-400 mb-2" />
                <p className="mb-2 text-sm text-slate-300">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-400">PDF, DOCX, TXT, MP3, MP4 or other files up to 100MB</p>
              </div>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Uploaded Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No documents uploaded yet</p>
            ) : (
              documents.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{getFileIcon(doc.type)}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{doc.size} MB</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400">{formatDate(doc.uploadedAt)}</span>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Uploaded
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-600"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(doc.id)}
                      className="border-red-600/50 text-red-400 hover:bg-red-600/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card className="bg-slate-800 border-slate-700 mt-8">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Total Documents</p>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Total Size</p>
                <p className="text-2xl font-bold text-white">
                  {documents.reduce((sum, doc) => sum + doc.size, 0).toFixed(1)} MB
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Storage Used</p>
                <p className="text-2xl font-bold text-blue-400">
                  {(documents.reduce((sum, doc) => sum + doc.size, 0) / 1000 * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
