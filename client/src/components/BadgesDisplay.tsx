import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Lock, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BadgesDisplayProps {
  userId: string;
}

export function BadgesDisplay({ userId }: BadgesDisplayProps) {
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const { data: userBadges } = trpc.badges.getUserBadges.useQuery({
    userId,
  });

  const { data: badgeProgress } = trpc.badges.getBadgeProgress.useQuery({
    userId,
  });

  const { data: badgeCount } = trpc.badges.getBadgeCount.useQuery({
    userId,
  });

  const awardedBadgeTypes = new Set(userBadges?.map((b) => b.badgeType) || []);

  return (
    <div className="space-y-6">
      {/* Badge Count Summary */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Achievements Unlocked
            </h3>
            <p className="text-slate-400">
              Keep engaging to unlock more badges
            </p>
          </div>
          <div className="text-center">
            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{badgeCount || 0}</p>
            <p className="text-sm text-slate-400">badges</p>
          </div>
        </div>
      </Card>

      {/* Awarded Badges */}
      {userBadges && userBadges.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Your Badges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className="group relative p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg hover:from-amber-500/30 hover:to-orange-500/30 transition-all border border-amber-500/30 hover:border-amber-500/50"
              >
                <div className="text-4xl mb-2">{badge.definition?.icon}</div>
                <p className="text-sm font-semibold text-white text-center line-clamp-2">
                  {badge.definition?.name}
                </p>
                <p className="text-xs text-amber-400 mt-1">Unlocked</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Badge Progress */}
      {badgeProgress && badgeProgress.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Progress to Next Badges
          </h3>
          <div className="space-y-4">
            {badgeProgress
              .filter((p) => !p.isUnlocked)
              .slice(0, 5)
              .map((progress) => (
                <div
                  key={progress.badge.id}
                  onClick={() => setSelectedBadge(progress)}
                  className="p-4 bg-slate-700/50 rounded hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{progress.badge.icon}</span>
                      <div>
                        <p className="font-semibold text-white">
                          {progress.badge.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {progress.badge.description}
                        </p>
                      </div>
                    </div>
                    <Target className="w-5 h-5 text-slate-400" />
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-400">
                      {progress.currentValue} / {progress.requirement}
                    </p>
                    <p className="text-xs font-semibold text-amber-400">
                      {progress.percentage}%
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Badge Detail Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span className="text-4xl">
                {selectedBadge?.definition?.icon || selectedBadge?.badge?.icon}
              </span>
              {selectedBadge?.definition?.name || selectedBadge?.badge?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300">
              {selectedBadge?.definition?.description ||
                selectedBadge?.badge?.description}
            </p>

            {selectedBadge?.definition && (
              <div className="p-4 bg-slate-700/50 rounded">
                <p className="text-sm text-slate-400 mb-2">Category</p>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  {selectedBadge.definition.category}
                </Badge>
              </div>
            )}

            {selectedBadge?.awardedAt && (
              <div className="p-4 bg-slate-700/50 rounded">
                <p className="text-sm text-slate-400 mb-2">Unlocked On</p>
                <p className="text-white font-semibold">
                  {new Date(selectedBadge.awardedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {selectedBadge?.percentage !== undefined && (
              <div className="p-4 bg-slate-700/50 rounded">
                <p className="text-sm text-slate-400 mb-2">Progress</p>
                <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full"
                    style={{ width: `${selectedBadge.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-amber-400 mt-2 font-semibold">
                  {selectedBadge.percentage}% Complete
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
