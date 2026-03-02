import React, { useState, useRef } from 'react';
import { Upload, X, File, FileText, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface TaskFileAttachmentProps {
  onFilesSelected: (files: AttachedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
}

export default function TaskFileAttachment({
  onFilesSelected,
  maxFiles = 5,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
}: TaskFileAttachmentProps) {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: AttachedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size
      if (file.size > maxFileSize) {
        alert(`File "${file.name}" exceeds maximum size of ${formatFileSize(maxFileSize)}`);
        continue;
      }

      // Check total files
      if (attachedFiles.length + newFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        break;
      }

      newFiles.push({
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      });
    }

    const updated = [...attachedFiles, ...newFiles];
    setAttachedFiles(updated);
    onFilesSelected(updated);
  };

  const handleRemoveFile = (id: string) => {
    const updated = attachedFiles.filter((f) => f.id !== id);
    setAttachedFiles(updated);
    onFilesSelected(updated);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-cyan-500 bg-cyan-500/10'
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-slate-300 font-medium">Drag files here or click to browse</p>
        <p className="text-sm text-slate-500">
          Max {maxFiles} files, {formatFileSize(maxFileSize)} each
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Attached Files List */}
      {attachedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-400">
            {attachedFiles.length} file{attachedFiles.length !== 1 ? 's' : ''} attached
          </p>
          {attachedFiles.map((file) => (
            <Card
              key={file.id}
              className="bg-slate-800 border-slate-700 p-3 flex items-center justify-between hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-slate-400 flex-shrink-0">{getFileIcon(file.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveFile(file.id)}
                className="text-slate-400 hover:text-red-500 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
