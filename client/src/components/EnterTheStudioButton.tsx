'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Music, Video, Zap, Crown, Sparkles, ArrowRight, Lock, Unlock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'wouter';
import { TIER_DESCRIPTIONS, TIER_FEATURES, type UserTier } from '@/server/tier-system';
import { toast } from 'sonner';

interface EnterTheStudioButtonProps {
  variant?: 'hero' | 'nav' | 'inline';
  className?: string;
}

export function EnterTheStudioButton({ variant = 'hero', className = '' }: EnterTheStudioButtonProps) {
  const { user } = useAuth();
  const [, navigate] = useNavigate();
  const [selectedTier, setSelectedTier] = useState<UserTier | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const userTier = (user?.tier as UserTier) || 'free';

  const handleEnterStudio = () => {
    if (!user) {
      toast.error('Please log in to access the studio');
      return;
    }

    setIsOpen(true);
  };

  const handleSelectTier = (tier: UserTier) => {
    setSelectedTier(tier);
    setIsOpen(false);
    
    // Navigate to studio with tier
    if (tier === 'free') {
      navigate('/studio/free');
    } else if (tier === 'professional') {
      navigate('/studio/pro');
    } else {
      navigate('/studio/advanced');
    }
    
    toast.success(`Entering ${TIER_DESCRIPTIONS[tier].name} Studio...`);
  };

  // Hero variant - Large prominent button
  if (variant === 'hero') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={handleEnterStudio}
            className={`group relative px-8 py-6 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 ${className}`}
          >
            <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
            🀄️ ENTER THE STUDIO 🐲
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-white flex items-center gap-2">
              <Music className="w-8 h-8 text-purple-400" />
              Choose Your Studio Level
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
              Select the tier that matches your creative needs
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {(['free', 'professional', 'advanced'] as const).map((tier) => {
              const isCurrentTier = userTier === tier;
              const tierInfo = TIER_DESCRIPTIONS[tier];
              const features = TIER_FEATURES[tier];
              const audioFeatures = [
                features.soundDNA,
                features.creativeCoPilot,
                features.frequencyMastering,
                features.nftMinting,
              ].filter(Boolean).length;
              const videoFeatures = [
                features.aiCinematicDirector,
                features.vfxEngine,
                features.autonomousEditing,
                features.holographicCapture,
              ].filter(Boolean).length;

              return (
                <Card
                  key={tier}
                  className={`relative border-2 transition-all cursor-pointer hover:shadow-lg ${
                    isCurrentTier
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-600/30 hover:border-slate-500'
                  }`}
                  onClick={() => handleSelectTier(tier)}
                >
                  {isCurrentTier && (
                    <Badge className="absolute top-2 right-2 bg-purple-600">Current</Badge>
                  )}
                  {tier === 'advanced' && (
                    <Badge className="absolute top-2 right-2 bg-amber-600 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Legendary
                    </Badge>
                  )}

                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-white">{tierInfo.name}</CardTitle>
                      {tier === 'free' && <Unlock className="w-5 h-5 text-green-400" />}
                      {tier === 'professional' && <Zap className="w-5 h-5 text-yellow-400" />}
                      {tier === 'advanced' && <Crown className="w-5 h-5 text-amber-400" />}
                    </div>
                    <CardDescription className="text-amber-400 font-semibold">
                      {tierInfo.price}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-300">{tierInfo.description}</p>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Audio Features</span>
                        <Badge variant="outline">{audioFeatures}/4</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Video Features</span>
                        <Badge variant="outline">{videoFeatures}/4</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Storage</span>
                        <Badge variant="outline">{features.maxStorageGB}GB</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Band Members</span>
                        <Badge variant="outline">{features.maxBandMembers}</Badge>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSelectTier(tier)}
                      className={`w-full mt-4 ${
                        isCurrentTier
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : tier === 'professional'
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : tier === 'advanced'
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isCurrentTier ? 'Current Tier' : 'Enter Studio'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Navigation variant - Compact button
  if (variant === 'nav') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={handleEnterStudio}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
          >
            <Music className="w-4 h-4 mr-2" />
            Studio
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          {/* Same tier selection UI as hero */}
        </DialogContent>
      </Dialog>
    );
  }

  // Inline variant - Small button
  return (
    <Button
      onClick={handleEnterStudio}
      variant="outline"
      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
    >
      <Music className="w-4 h-4 mr-2" />
      Enter Studio
    </Button>
  );
}

/**
 * Tier Badge Component - Shows user's current tier
 */
export function TierBadge() {
  const { user } = useAuth();
  const userTier = (user?.tier as UserTier) || 'free';
  const tierInfo = TIER_DESCRIPTIONS[userTier];

  const tierColors = {
    free: 'bg-slate-600/20 text-slate-300',
    professional: 'bg-yellow-600/20 text-yellow-300',
    advanced: 'bg-amber-600/20 text-amber-300',
  };

  return (
    <Badge className={tierColors[userTier]}>
      {tierInfo.name} {userTier === 'advanced' && <Crown className="w-3 h-3 ml-1" />}
    </Badge>
  );
}

/**
 * Feature Lock Component - Shows locked features with upgrade prompt
 */
export function FeatureLock({ feature, tier }: { feature: string; tier: UserTier }) {
  const [, navigate] = useNavigate();
  const { user } = useAuth();
  const userTier = (user?.tier as UserTier) || 'free';
  const isLocked = userTier === 'free' || (userTier === 'professional' && tier === 'advanced');

  if (!isLocked) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-not-allowed">
      <div className="text-center">
        <Lock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <p className="text-white font-semibold text-sm mb-2">{feature}</p>
        <Button
          size="sm"
          onClick={() => navigate('/pricing')}
          className="bg-amber-600 hover:bg-amber-700"
        >
          Upgrade Now
        </Button>
      </div>
    </div>
  );
}
