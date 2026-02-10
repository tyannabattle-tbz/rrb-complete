import React from 'react';
import { VideoGenerationWithWorkflow } from '@/components/VideoGenerationWithWorkflow';
import { ArrowLeft, Film } from 'lucide-react';

export function VideoProductionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a href="/studio" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Studio
          </a>
          <div className="flex items-center gap-3 mb-2">
            <Film className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Video Production Hub</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Generate videos and automatically schedule them for broadcast on RRB Radio
          </p>
        </div>

        <VideoGenerationWithWorkflow />
      </div>
    </div>
  );
}

export default VideoProductionPage;
