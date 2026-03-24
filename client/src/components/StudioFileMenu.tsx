/**
 * Professional Studio File Menu
 * Handles all file operations: New, Open, Save, Export, Import
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface StudioFileMenuProps {
  onNewProject?: () => void;
  onOpenProject?: (file: File) => void;
  onSaveProject?: () => void;
  onExportAudio?: () => void;
  onImportProject?: (file: File) => void;
}

export function StudioFileMenu({
  onNewProject,
  onOpenProject,
  onSaveProject,
  onExportAudio,
  onImportProject,
}: StudioFileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleNewProject = () => {
    onNewProject?.();
    toast.success('New project created');
    setIsOpen(false);
  };

  const handleOpenProject = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onOpenProject?.(file);
      toast.success(`Project "${file.name}" opened`);
      setIsOpen(false);
    }
  };

  const handleSaveProject = () => {
    onSaveProject?.();
    toast.success('Project saved successfully');
    setIsOpen(false);
  };

  const handleExportAudio = () => {
    onExportAudio?.();
    toast.success('Exporting audio...');
    setIsOpen(false);
  };

  const handleImportProject = () => {
    importInputRef.current?.click();
  };

  const handleImportSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportProject?.(file);
      toast.success(`Project "${file.name}" imported`);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-gray-300 hover:text-white">
          File
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">File Menu</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Button
            onClick={handleNewProject}
            className="w-full justify-start text-left bg-gray-800 hover:bg-gray-700 text-white"
          >
            <span className="mr-3">📄</span>
            New Project
          </Button>

          <Button
            onClick={handleOpenProject}
            className="w-full justify-start text-left bg-gray-800 hover:bg-gray-700 text-white"
          >
            <span className="mr-3">📁</span>
            Open Saved Project
          </Button>

          <Button
            onClick={handleSaveProject}
            className="w-full justify-start text-left bg-gray-800 hover:bg-gray-700 text-white"
          >
            <span className="mr-3">💾</span>
            Save Project
          </Button>

          <Button
            onClick={handleExportAudio}
            className="w-full justify-start text-left bg-gray-800 hover:bg-gray-700 text-white"
          >
            <span className="mr-3">⬇️</span>
            Export Audio
          </Button>

          <Button
            onClick={handleImportProject}
            className="w-full justify-start text-left bg-gray-800 hover:bg-gray-700 text-white"
          >
            <span className="mr-3">⬆️</span>
            Import Project
          </Button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".rrb,.rrbs,.rrbstudio"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={importInputRef}
          type="file"
          accept=".rrb,.rrbs,.rrbstudio,.zip"
          onChange={handleImportSelect}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}
