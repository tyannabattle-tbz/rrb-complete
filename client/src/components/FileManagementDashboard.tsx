import React, { useState, useRef } from 'react';
import { Upload, Download, Trash2, Share2, FileIcon, Image, Video, Music, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth';

interface FileItem {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  accessCount: number;
  isPublic: boolean;
}

export default function FileManagementDashboard() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageUsage, setStorageUsage] = useState({
    usedBytes: 0,
    limitBytes: 10 * 1024 * 1024 * 1024, // 10GB
    percentageUsed: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    setIsUploading(true);
    let uploadedCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const uploadedFile = await response.json();
          setFiles((prev) => [uploadedFile, ...prev]);
          uploadedCount++;
          setUploadProgress((uploadedCount / selectedFiles.length) * 100);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleShare = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/share`, { method: 'POST' });
      if (response.ok) {
        const { shareUrl } = await response.json();
        navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">File Storage</h2>
          <p className="text-slate-400">Manage your cloud files and documents</p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-white mb-2">Uploading files...</p>
              <Progress value={uploadProgress} className="h-2" />
            </div>
            <span className="text-slate-400">{Math.round(uploadProgress)}%</span>
          </div>
        </Card>
      )}

      {/* Storage Usage */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Storage Usage</h3>
          <span className="text-slate-400">
            {formatFileSize(storageUsage.usedBytes)} / {formatFileSize(storageUsage.limitBytes)}
          </span>
        </div>
        <Progress value={storageUsage.percentageUsed} className="h-3" />
        <p className="text-sm text-slate-400 mt-2">
          {storageUsage.percentageUsed.toFixed(1)}% of storage used
        </p>
      </Card>

      {/* Files List */}
      <div className="space-y-3">
        {files.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-12 text-center">
            <FileIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No files yet. Upload your first file to get started.</p>
          </Card>
        ) : (
          files.map((file) => (
            <Card key={file.id} className="bg-slate-800 border-slate-700 p-4 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-slate-400">{getFileIcon(file.mimeType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{file.fileName}</p>
                    <p className="text-sm text-slate-400">
                      {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(file.id, file.fileName)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleShare(file.id)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(file.id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Box */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Storage Features</h3>
        <ul className="space-y-2 text-slate-400">
          <li className="flex items-center gap-2">
            <span className="text-cyan-500">✓</span> Secure cloud storage with S3 encryption
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-500">✓</span> Shareable links with expiration dates
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-500">✓</span> Complete audit trail of all file access
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-500">✓</span> Automatic virus scanning on upload
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-500">✓</span> Tier-based storage quotas
          </li>
        </ul>
      </Card>
    </div>
  );
}
