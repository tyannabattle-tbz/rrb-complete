/**
 * QUMUS Trending Promotion Panel
 * 
 * Displays trending tracks based on play count data and allows
 * QUMUS to autonomously promote them to prime-time schedule slots.
 * 
 * A Canryn Production — All Rights Reserved
 */
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAudio } from '@/contexts/AudioContext';
import {
  TrendingUp, Zap, Play, ArrowUpRight, Clock, BarChart3,
  CheckCircle2, AlertCircle, Loader2, RefreshCw, Shield,
  ChevronRight, Music, Star, Target
} from 'lucide-react';
import { toast } from 'sonner';

export function TrendingPromotionPanel() {
  const audio = useAudio();
  const [isExecuting, setIsExecuting] = useState(false);

  // Fetch trending tracks
  const { data: trendingData, isLoading: trendingLoading, refetch: refetchTrending } =
    trpc.audio.getTrending.useQuery(undefined, {
      refetchInterval: 60_000, // refresh every minute
    });

  // Fetch promotion history
  const { data: historyData, refetch: refetchHistory } =
    trpc.audio.getPromotionHistory.useQuery(undefined, {
      refetchInterval: 120_000,
    });

  // Fetch promotion policy
  const { data: policyData } = trpc.audio.getPromotionPolicy.useQuery();

  // Execute promotions mutation
  const executePromotions = trpc.audio.executePromotions.useMutation({
    onSuccess: (result) => {
      setIsExecuting(false);
      refetchTrending();
      refetchHistory();
      const { summary } = result;
      if (summary.trendingFound === 0) {
        toast.info('No trending tracks found', {
          description: 'Play more tracks to generate trending data.',
        });
      } else {
        toast.success(`QUMUS Promotion Cycle Complete`, {
          description: `${summary.autoApproved} auto-approved, ${summary.pendingReview} pending review`,
        });
      }
    },
    onError: () => {
      setIsExecuting(false);
      toast.error('Promotion cycle failed');
    },
  });

  const handleExecute = (dryRun: boolean) => {
    setIsExecuting(true);
    executePromotions.mutate({ dryRun });
  };

  const trending = trendingData?.trending || [];
  const history = (historyData?.decisions || []) as any[];
  const policy = policyData?.policy;
  const slots = policyData?.slots || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">QUMUS Trending Promotions</h2>
            <p className="text-xs text-muted-foreground">
              Autonomous track promotion based on play velocity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { refetchTrending(); refetchHistory(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/50 hover:bg-accent transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            onClick={() => handleExecute(true)}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
          >
            {isExecuting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Target className="h-3.5 w-3.5" />}
            Dry Run
          </button>
          <button
            onClick={() => handleExecute(false)}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {isExecuting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            Execute Promotions
          </button>
        </div>
      </div>

      {/* Policy Summary */}
      {policy && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/50 bg-card/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Min Plays</span>
            </div>
            <p className="text-lg font-bold">{policy.minPlayCount}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Velocity Threshold</span>
            </div>
            <p className="text-lg font-bold">{policy.trendVelocityThreshold}/hr</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Auto-Approve</span>
            </div>
            <p className="text-lg font-bold">{policy.autoApproveThreshold}%+</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Cooldown</span>
            </div>
            <p className="text-lg font-bold">{policy.cooldownMinutes}m</p>
          </div>
        </div>
      )}

      {/* Trending Tracks */}
      <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Trending Now</h3>
            {trendingData && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">
                {trending.length} trending / {trendingData.totalTracksAnalyzed} analyzed
              </span>
            )}
          </div>
        </div>

        {trendingLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : trending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Music className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No trending tracks yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Play tracks across the platform to generate trending data. QUMUS needs at least {policy?.minPlayCount || 3} plays per track.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {trending.map((track, idx) => (
              <div
                key={track.trackId}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent/20 transition-colors"
              >
                {/* Rank */}
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  idx === 0 ? 'bg-amber-500/20 text-amber-500' :
                  idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                  'bg-orange-400/20 text-orange-400'
                }`}>
                  #{idx + 1}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 shrink-0">
                  {/* Play Count */}
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold">{track.playCount}</p>
                    <p className="text-[9px] text-muted-foreground">plays</p>
                  </div>

                  {/* Velocity */}
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-green-500">
                      {track.velocity.toFixed(1)}/hr
                    </p>
                    <p className="text-[9px] text-muted-foreground">velocity</p>
                  </div>

                  {/* Trend Score */}
                  <div className="w-16">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] text-muted-foreground">Score</span>
                      <span className="text-[10px] font-bold">{track.trendScore}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-accent/30 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          track.trendScore >= 80 ? 'bg-amber-500' :
                          track.trendScore >= 60 ? 'bg-green-500' :
                          track.trendScore >= 40 ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${track.trendScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="w-16">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] text-muted-foreground">Conf</span>
                      <span className="text-[10px] font-bold">{track.confidence}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-accent/30 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          track.confidence >= 75 ? 'bg-green-500' :
                          track.confidence >= 50 ? 'bg-amber-500' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${track.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Promotion Slot */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 text-primary shrink-0">
                    <ArrowUpRight className="h-3 w-3" />
                    <span className="text-[10px] font-semibold capitalize">
                      {track.promotionSlot.replace(/-/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prime-Time Slots */}
      {slots.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Schedule Slot Priority</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  slot.priority >= 90
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : slot.priority >= 70
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-border/30 bg-accent/10'
                }`}
              >
                <div className={`h-2 w-2 rounded-full shrink-0 ${
                  slot.priority >= 90 ? 'bg-amber-500' :
                  slot.priority >= 70 ? 'bg-green-500' :
                  slot.priority >= 50 ? 'bg-blue-500' :
                  'bg-gray-400'
                }`} />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold truncate">{slot.label}</p>
                  <p className="text-[9px] text-muted-foreground">Priority: {slot.priority}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promotion History */}
      <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Promotion Decision Log</h3>
          {history.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/50 text-muted-foreground font-medium">
              {history.length} decisions
            </span>
          )}
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Shield className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No promotion decisions yet</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Click "Execute Promotions" to run the QUMUS trending analysis
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30 max-h-64 overflow-y-auto">
            {history.map((decision: any, idx: number) => (
              <div key={decision.id || idx} className="flex items-center gap-3 px-4 py-2.5">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                  decision.status === 'auto_approved'
                    ? 'bg-green-500/20 text-green-500'
                    : decision.status === 'executed'
                    ? 'bg-blue-500/20 text-blue-500'
                    : decision.status === 'vetoed'
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-amber-500/20 text-amber-500'
                }`}>
                  {decision.status === 'auto_approved' || decision.status === 'executed' ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : decision.status === 'vetoed' ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{decision.description}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {decision.created_at ? new Date(decision.created_at).toLocaleString() : 'Unknown time'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    decision.status === 'auto_approved' ? 'bg-green-500/10 text-green-500' :
                    decision.status === 'executed' ? 'bg-blue-500/10 text-blue-500' :
                    decision.status === 'vetoed' ? 'bg-red-500/10 text-red-500' :
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    {decision.status?.replace('_', ' ')}
                  </span>
                  {decision.confidence && (
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {decision.confidence}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrendingPromotionPanel;
