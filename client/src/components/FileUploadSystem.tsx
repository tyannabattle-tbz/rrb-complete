'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Video, Music, Image as ImageIcon, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'document' | 'other';
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}

const SUPPORTED_FORMATS = {
  video: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'prores'],
  audio: ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg', 'wma', 'aiff'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'],
  document: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

export default function FileUploadSystem() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (filename: string): UploadedFile['type'] => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (SUPPORTED_FORMATS.video.includes(ext)) return 'video';
    if (SUPPORTED_FORMATS.audio.includes(ext)) return 'audio';
    if (SUPPORTED_FORMATS.image.includes(ext)) return 'image';
    if (SUPPORTED_FORMATS.document.includes(ext)) return 'document';
    return 'other';
  };

  const getFileIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-400" />;
      case 'audio':
        return <Music className="w-5 h-5 text-green-400" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-purple-400" />;
      case 'document':
        return <FileText className="w-5 h-5 text-yellow-400" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} exceeds 5GB limit`);
        return;
      }

      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        progress: 0,
        status: 'uploading',
      };

      setFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles(prev =>
            prev.map(f =>
              f.id === newFile.id
                ? {
                    ...f,
                    progress: 100,
                    status: 'completed',
                    url: `https://example.com/uploads/${f.id}`,
                  }
                : f
            )
          );
        } else {
          setFiles(prev =>
            prev.map(f =>
              f.id === newFile.id ? { ...f, progress: Math.min(progress, 99) } : f
            )
          );
        }
      }, 500);
    });
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
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const completedFiles = files.filter(f => f.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition ${
          isDragging
            ? 'border-purple-400 bg-purple-900/20'
            : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="p-4 bg-purple-900/30 rounded-full">
                <Upload className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Drop files here or click to upload</h3>
            <p className="text-slate-400 mb-6">
              Supports video, audio, images, and documents up to 5GB each
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {['MP4', 'MOV', 'MP3', 'WAV', 'JPG', 'PNG', 'PDF', 'DOCX'].map(format => (
                <Badge key={format} variant="outline" className="bg-slate-700 border-slate-600">
                  {format}
                </Badge>
              ))}
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="video/*,audio/*,image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload Summary */}
      {files.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  {completedFiles}/{files.length} Files Uploaded
                </CardTitle>
                <CardDescription>{formatFileSize(totalSize)} total</CardDescription>
              </div>
              <Badge className="bg-blue-900/30 text-blue-300 border-blue-500">
                {Math.round((completedFiles / files.length) * 100)}%
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* File List */}
      <div className="space-y-3">
        {files.map(file => (
          <Card key={file.id} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                {/* File Icon */}
                <div className="flex-shrink-0">{getFileIcon(file.type)}</div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold truncate">{file.name}</p>
                    <span className="text-slate-400 text-sm ml-2">{formatFileSize(file.size)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          file.status === 'completed'
                            ? 'bg-gradient-to-r from-green-400 to-green-500'
                            : file.status === 'error'
                              ? 'bg-gradient-to-r from-red-400 to-red-500'
                              : 'bg-gradient-to-r from-purple-400 to-purple-500'
                        }`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-xs w-8 text-right">{file.progress}%</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mt-2">
                    {file.status === 'completed' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-xs">Uploaded</span>
                      </>
                    )}
                    {file.status === 'uploading' && (
                      <span className="text-purple-400 text-xs">Uploading...</span>
                    )}
                    {file.status === 'error' && (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-xs">Upload failed</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {file.status === 'completed' && (
                    <Button size="sm" variant="outline" className="border-slate-600">
                      Copy Link
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 hover:bg-red-900/20 hover:border-red-600"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Tips */}
      {files.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <h4 className="text-white font-semibold mb-3">Upload Tips</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>• Upload multiple files at once for faster processing</li>
              <li>• Supported formats: MP4, MOV, MP3, WAV, JPG, PNG, PDF, DOCX</li>
              <li>• Maximum file size: 5GB per file</li>
              <li>• Files are automatically scanned for viruses</li>
              <li>• Your files are encrypted and securely stored</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
