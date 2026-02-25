import React from 'react';
import { VideoGenerationWithWorkflow } from '@/components/VideoGenerationWithWorkflow';

export function VideoProductionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Video Production Hub</h1>
          <p className="text-lg text-gray-600">
            Generate videos and automatically schedule them for broadcast on RRB Radio
          </p>
        </div>

        <VideoGenerationWithWorkflow />
      </div>
    </div>
  );
}

export default VideoProductionPage;
