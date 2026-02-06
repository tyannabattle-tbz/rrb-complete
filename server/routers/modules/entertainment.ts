/**
 * Entertainment Module Router
 * Groups all entertainment, streaming, and media-related routers
 */

import { router } from '../../_core/trpc';
import { rockinBoogieRouter } from '../rockinBoogie';
import { hybridCastRouter } from '../hybridCastRouter';
import { hybridCastNodesRouter } from '../hybridCastNodes';
import { radioStationsRouter } from '../radioStations';
import { podcastPlaybackRouter } from '../podcastPlayback';
import { playbackControlRouter } from '../playbackControl';
import { audioMusicRouter } from '../audioMusicRouter';
import { videoEditingRouter } from '../videoEditingRouter';
import { motionGenerationRouter } from '../motionGenerationRouter';
import { videoProcessingRouter } from '../videoProcessingRouter';
import { batchVideoRouter } from '../batchVideoRouter';
import { watermarkRouter } from '../watermarkRouter';
import { studioStreamingRouter } from '../studioStreaming';

export const entertainmentRouter = router({
  // Podcast & Audio
  rockinBoogie: rockinBoogieRouter,
  podcastPlayback: podcastPlaybackRouter,
  playbackControl: playbackControlRouter,
  audioMusic: audioMusicRouter,

  // Broadcasting
  hybridCast: hybridCastRouter,
  hybridCastNodes: hybridCastNodesRouter,
  radioStations: radioStationsRouter,

  // Video & Media
  videoEditing: videoEditingRouter,
  motionGeneration: motionGenerationRouter,
  videoProcessing: videoProcessingRouter,
  batchVideo: batchVideoRouter,
  watermark: watermarkRouter,

  // Studio
  studioStreaming: studioStreamingRouter,
});
