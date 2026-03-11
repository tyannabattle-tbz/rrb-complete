import React from 'react';
import { VideoGenerationWithWorkflow } from '@/components/VideoGenerationWithWorkflow';

export function VideoProductionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Video Production Studio</h1>
          <p className="text-base md:text-lg text-gray-400">
            AI-powered video production — generate scripts, storyboards, and narration for RRB Radio broadcasts
          </p>
        </div>

        <VideoGenerationWithWorkflow />
      </div>
    </div>
  );
}

export default VideoProductionPage;
