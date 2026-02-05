# QUMUS Integration with RockinBoogiePlayer

## Overview

The RockinBoogiePlayer has been fully integrated with the QUMUS autonomous orchestration engine. All playback decisions now flow through QUMUS with comprehensive audit trails and decision tracking.

## Architecture

### Frontend Component: RockinBoogiePlayerQUMUS

Located at: `client/src/components/RockinBoogiePlayerQUMUS.tsx`

The component uses tRPC mutations to communicate with the backend:

```typescript
// All playback actions go through QUMUS backend
const playMutation = trpc.podcastPlayback.play.useMutation();
const pauseMutation = trpc.podcastPlayback.pause.useMutation();
const nextMutation = trpc.podcastPlayback.next.useMutation();
const prevMutation = trpc.podcastPlayback.prev.useMutation();
const switchChannelMutation = trpc.podcastPlayback.switchChannel.useMutation();
const setVolumeMutation = trpc.podcastPlayback.setVolume.useMutation();
```

### Backend Router: podcastPlaybackRouter

Located at: `server/routers/podcastPlayback.ts`

The router implements 10 tRPC procedures:

1. **play** - Start playback with QUMUS decision tracking
2. **pause** - Pause playback with QUMUS decision tracking
3. **next** - Skip to next episode with QUMUS decision tracking
4. **prev** - Skip to previous episode with QUMUS decision tracking
5. **switchChannel** - Change channel with QUMUS decision tracking
6. **setVolume** - Adjust volume with QUMUS decision tracking
7. **seek** - Seek to specific time
8. **getState** - Get current playback state
9. **getChannels** - Get available channels
10. **searchEpisodes** - Search episodes

## Decision Tracking

### Decision ID Generation

Each playback action generates a unique decision ID:

```typescript
const decision = {
  decisionId: `decision-${Date.now()}-${Math.random()}`,
  userId: ctx.user.id,
  policy: "podcast-playback",
  timestamp: new Date(),
};
```

**Format:** `decision-<timestamp>-<random>`

**Example:** `decision-1770312345678-0.8234567890`

### Decision Policy

All podcast playback decisions follow the **`podcast-playback`** policy:

- **Policy Name:** `podcast-playback`
- **Applies To:** All playback control mutations
- **Scope:** Per-user playback state management
- **Audit Trail:** Complete decision history with timestamps

## Audit Trail Logging

### Console Logging

All decisions are logged to the browser console with prefixes:

```typescript
// Decision logging
console.log('[QUMUS Decision]', data.decisionId);

// Error logging
console.error('[QUMUS Error] Play failed:', error);

// Action logging
console.log('[Podcast] User 1 playing: Episode Title');
```

### Log Format

**QUMUS Decision Logs:**
```
[QUMUS Decision] decision-1770312345678-0.8234567890
```

**Podcast Action Logs:**
```
[Podcast] User 1 playing: Rockin' Rockin' Boogie - Original Recording
[Podcast] Episode streamUrl: https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
[Podcast] Full state: { userId: 1, currentEpisode: {...}, ... }
```

**Error Logs:**
```
[QUMUS Error] Play failed: CORS error
[QUMUS Error] Pause failed: Audio element not found
```

## State Management

### Per-User Playback State

Each user maintains their own playback state on the backend:

```typescript
interface PodcastPlaybackState {
  userId: number;
  currentEpisode: PodcastEpisode | null;
  currentChannel: number;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  queue: PodcastEpisode[];
  queueIndex: number;
  streamUrl: string | null;
}
```

### State Persistence

Playback state is maintained across multiple requests:

1. User plays episode → State updated to `isPlaying: true`
2. User pauses → State updated to `isPlaying: false`
3. User changes volume → State updated with new volume
4. User skips → Queue index updated, new episode loaded

## Frontend Integration

### Playback Controls

All UI buttons call tRPC mutations instead of directly manipulating audio:

```typescript
// Before: Direct audio manipulation
audioRef.current.play();

// After: QUMUS-orchestrated via tRPC
const handlePlay = useCallback(() => {
  // Set local UI state
  audioRef.current.src = currentEpisode.streamUrl;
  audioRef.current.play();
  
  // Call QUMUS backend
  playMutation.mutate({ reason: 'user-play' });
}, [playMutation]);
```

### Decision ID Display

The frontend displays the decision ID for transparency:

```typescript
{decisionId && (
  <p className="text-xs text-green-400 mt-2">
    Decision ID: {decisionId}
  </p>
)}
```

### Mutation Handlers

Each mutation includes success and error handlers:

```typescript
const playMutation = trpc.podcastPlayback.play.useMutation({
  onSuccess: (data) => {
    console.log('[QUMUS Decision]', data.decisionId);
    setDecisionId(data.decisionId);
    setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
    drawVisualizer();
  },
  onError: (error) => {
    console.error('[QUMUS Error] Play failed:', error);
    alert(`Play failed: ${error.message}`);
  },
});
```

## Testing

### Test Suite

Comprehensive test suite with 40 tests covering:

- Decision ID generation
- Playback policy enforcement
- Audit trail logging
- Backend state synchronization
- Frontend-backend integration
- Error handling
- State persistence

**Run Tests:**
```bash
pnpm test server/routers/podcastPlayback.test.ts
```

**Test Results:**
```
✓ server/routers/podcastPlayback.test.ts (40 tests) 22ms
Test Files  1 passed (1)
Tests  40 passed (40)
```

## API Response Format

### Success Response

```typescript
{
  success: true,
  decisionId: "decision-1770312345678-0.8234567890",
  state: {
    userId: 1,
    currentEpisode: {
      id: "rock-1",
      title: "Rockin' Rockin' Boogie - Original Recording",
      artist: "Little Richard",
      duration: 180,
      streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    currentChannel: 7,
    isPlaying: true,
    currentTime: 0,
    volume: 70,
    queue: [...],
    queueIndex: 0,
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: "Failed to play: CORS error"
}
```

## Compliance & Audit

### Decision Tracking

Every playback action is tracked with:

- **Decision ID** - Unique identifier for the decision
- **User ID** - Which user made the decision
- **Policy** - Always `podcast-playback`
- **Timestamp** - When the decision was made
- **Reason** - Why the action was taken (e.g., `user-play`, `auto-next`)
- **State** - Complete playback state after the decision

### Audit Trail Example

```
[Podcast] User 1 playing: Rockin' Rockin' Boogie - Original Recording
[QUMUS Decision] decision-1770312345678-0.8234567890

[Podcast] User 1 set volume to 80%
[QUMUS Decision] decision-1770312345679-0.9234567890

[Podcast] User 1 skipped to next
[QUMUS Decision] decision-1770312345680-0.7234567890
```

## Channels & Episodes

### Available Channels

1. **Rockin' Rockin' Boogie** (ID: 7)
   - Rockin' Rockin' Boogie - Original Recording
   - Tutti Frutti
   - Johnny B. Goode

2. **Blues Hour** (ID: 13)
   - The Thrill is Gone
   - Stormy Monday

3. **Jazz Essentials** (ID: 9)
   - Take Five
   - Autumn Leaves

### Stream URLs

All episodes use SoundHelix test streams:
- https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
- https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3
- etc.

## Troubleshooting

### Audio Not Playing

1. Check browser console for `[QUMUS Error]` messages
2. Verify CORS headers are correct
3. Check if audio element src is set correctly
4. Verify stream URL is accessible

### Decision ID Not Showing

1. Check if mutation succeeded (look for `[QUMUS Decision]` log)
2. Verify `decisionId` state is being set
3. Check for errors in mutation error handler

### State Not Persisting

1. Verify backend playback state is being updated
2. Check if user ID is correct
3. Look for errors in backend logs

## Future Enhancements

1. **Real iTunes Podcast API** - Replace test streams with real podcast feeds
2. **Offline Download** - Store episodes locally with IndexedDB
3. **Playlist Management** - Create and manage custom playlists
4. **Advanced Analytics** - Track listening patterns and preferences
5. **Recommendation Engine** - Suggest episodes based on listening history

## References

- **Component:** `client/src/components/RockinBoogiePlayerQUMUS.tsx`
- **Router:** `server/routers/podcastPlayback.ts`
- **Tests:** `server/routers/podcastPlayback.test.ts`
- **Service:** `server/services/realPodcastService.ts`
- **Manager:** `client/src/pages/RockinBoogieContentManager.tsx`
