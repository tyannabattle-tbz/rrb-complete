import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, Download, CheckCircle2, Loader2, AlertCircle, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: number;
  url: string;
  s3Key: string;
}

const STORAGE_KEY = 'qumus-documents';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function loadDocuments(): UploadedDocument[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDocuments(docs: UploadedDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export default function DocumentUpload() {
  const { user, isLoading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<UploadedDocument[]>(loadDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const uploadMutation = trpc.qumusFileUpload.uploadFile.useMutation();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      toast.error('Please sign in to upload documents');
      return;
    }

    setUploading(true);
    const newDocs: UploadedDocument[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}`);

        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds 50MB limit`);
          continue;
        }

        // Convert file to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data:mime;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload to S3 via tRPC
        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileSize: file.size,
          base64Data,
          description: `Document uploaded via Document Manager`,
        });

        const newDoc: UploadedDocument = {
          id: result.fileId || `doc-${Date.now()}-${i}`,
          name: file.name,
          size: parseFloat((file.size / 1024 / 1024).toFixed(2)),
          type: file.name.split('.').pop() || 'unknown',
          uploadedAt: Date.now(),
          url: result.s3Url,
          s3Key: result.metadata?.s3Key || '',
        };
        newDocs.push(newDoc);
      }

      if (newDocs.length > 0) {
        const updated = [...documents, ...newDocs];
        setDocuments(updated);
        saveDocuments(updated);
        toast.success(`${newDocs.length} document(s) uploaded to cloud storage`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress('');
      // Reset the input
      event.target.value = '';
    }
  }, [user, documents, uploadMutation]);

  const handleDelete = (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    saveDocuments(updated);
    toast.success('Document removed from list');
  };

  const handleDownload = (doc: UploadedDocument) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
      toast.success(`Downloading ${doc.name}`);
    } else {
      toast.error('Download URL not available');
    }
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
      png: '🖼️',
      jpg: '🖼️',
      jpeg: '🖼️',
      webp: '🖼️',
    };
    return icons[type.toLowerCase()] || '📎';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Upload className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Document Upload</h1>
          </div>
          <p className="text-slate-400">Upload and manage documents for Rockin' Rockin' Boogie — stored in cloud (S3) for access from any device</p>
        </div>

        {/* Cloud Storage Notice */}
        <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
          <Cloud className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium">Cloud Storage Enabled</p>
            <p className="text-xs text-blue-300/70 mt-1">
              Files are uploaded to S3 cloud storage and accessible from any device — Mac Mini, iPhone, or any browser.
              {!user && (
                <span className="text-amber-400 ml-1">Sign in to upload documents.</span>
              )}
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardContent className="p-8">
            <label className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition ${
              user ? 'border-slate-600 cursor-pointer hover:bg-slate-700/50' : 'border-slate-700 cursor-not-allowed opacity-50'
            }`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <>
                    <Loader2 className="w-10 h-10 text-blue-400 mb-2 animate-spin" />
                    <p className="mb-2 text-sm text-blue-300 font-semibold">{uploadProgress}</p>
                    <p className="text-xs text-slate-400">Uploading to cloud storage...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-400 mb-2" />
                    <p className="mb-2 text-sm text-slate-300">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-400">PDF, DOCX, TXT, images, audio, or other files up to 50MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={uploading || !user}
                className="hidden"
              />
            </label>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Uploaded Documents ({documents.length})
              {documents.length > 0 && (
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  <Cloud className="w-3 h-3 mr-1" /> Cloud Synced
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400">No documents uploaded yet</p>
                <p className="text-xs text-slate-500 mt-1">Upload files to access them from any device</p>
              </div>
            ) : (
              documents.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{getFileIcon(doc.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-400">{doc.size} MB</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400">{formatDate(doc.uploadedAt)}</span>
                        {doc.url ? (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Cloud
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                            Local Only
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-600"
                      onClick={() => handleDownload(doc)}
                      disabled={!doc.url}
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
                <p className="text-xs text-slate-400 mb-1">Storage Type</p>
                <p className="text-lg font-bold text-blue-400 flex items-center gap-1">
                  <Cloud className="w-5 h-5" /> S3 Cloud
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
