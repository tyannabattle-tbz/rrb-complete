import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Megaphone, DollarSign, BarChart3, Play, Pause, Plus,
  Trash2, Settings, ArrowLeft, Radio, Users, Clock, Target
} from "lucide-react";
import { Link } from "wouter";

const CATEGORY_COLORS: Record<string, string> = {
  commercial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  psa: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  promo: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  sponsor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  community: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export default function AdManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [newAd, setNewAd] = useState({
    sponsorName: "", campaignName: "", durationSeconds: 30,
    category: "commercial" as const, rotationWeight: 1, maxPlaysPerHour: 2,
    targetChannels: "all", timeSlotStart: "", timeSlotEnd: "",
  });

  const adsQuery = trpc.chunk5.adRotation.getAds.useQuery({ activeOnly: false, limit: 100 });
  const statsQuery = trpc.chunk5.adRotation.getStats.useQuery();

  const createMutation = trpc.chunk5.adRotation.createAd.useMutation({
    onSuccess: () => {
      toast({ title: "Ad Created" });
      setShowCreate(false);
      setNewAd({ sponsorName: "", campaignName: "", durationSeconds: 30, category: "commercial", rotationWeight: 1, maxPlaysPerHour: 2, targetChannels: "all", timeSlotStart: "", timeSlotEnd: "" });
      adsQuery.refetch();
      statsQuery.refetch();
    },
  });

  const updateMutation = trpc.chunk5.adRotation.updateAd.useMutation({
    onSuccess: () => { adsQuery.refetch(); statsQuery.refetch(); },
  });

  const deleteMutation = trpc.chunk5.adRotation.deleteAd.useMutation({
    onSuccess: () => {
      toast({ title: "Ad Removed" });
      adsQuery.refetch();
      statsQuery.refetch();
    },
  });

  const seedMutation = trpc.chunk5.adRotation.seedDefaults.useMutation({
    onSuccess: (data) => {
      toast({ title: "Default Ads Seeded", description: `${data.seeded} ads added to rotation` });
      adsQuery.refetch();
      statsQuery.refetch();
    },
  });

  const stats = statsQuery.data;
  const ads = adsQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-gray-950/80 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/qumus" className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-purple-500 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
                Ad Rotation Manager
              </h1>
              <p className="text-sm text-gray-400">QUMUS-managed commercial rotation across 50 RRB channels</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Ads", value: stats?.totalAds || 0, icon: Megaphone, color: "purple" },
            { label: "Active", value: stats?.activeAds || 0, icon: Play, color: "emerald" },
            { label: "Total Plays", value: stats?.totalPlays?.toLocaleString() || "0", icon: Radio, color: "amber" },
            { label: "Est. Revenue", value: `$${((stats?.estimatedRevenueCents || 0) / 100).toFixed(2)}`, icon: DollarSign, color: "green" },
          ].map((stat, i) => (
            <Card key={i} className="bg-gray-900/60 border-purple-500/20">
              <CardContent className="pt-4 pb-4 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 text-${stat.color}-400`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Breakdown */}
        {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stats.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
                <Badge className={CATEGORY_COLORS[cat.category || "commercial"]} variant="outline">
                  {cat.category}
                </Badge>
                <div className="mt-2 text-lg font-bold text-white">{cat.count}</div>
                <div className="text-xs text-gray-500">{cat.totalPlays?.toLocaleString() || 0} plays</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            className="bg-gradient-to-r from-purple-600 to-amber-600"
            onClick={() => setShowCreate(!showCreate)}
          >
            <Plus className="w-4 h-4 mr-2" /> New Ad
          </Button>
          {ads.length === 0 && (
            <Button
              variant="outline"
              className="border-amber-500/30 text-amber-400"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
            >
              <Settings className="w-4 h-4 mr-2" /> Seed Default Ads
            </Button>
          )}
        </div>

        {/* Create Form */}
        {showCreate && (
          <Card className="bg-gray-900/60 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-400 text-lg">New Ad / Commercial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Sponsor Name</label>
                  <Input value={newAd.sponsorName} onChange={(e) => setNewAd(p => ({ ...p, sponsorName: e.target.value }))} className="bg-gray-800 border-gray-700" placeholder="Company name" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Campaign Name</label>
                  <Input value={newAd.campaignName} onChange={(e) => setNewAd(p => ({ ...p, campaignName: e.target.value }))} className="bg-gray-800 border-gray-700" placeholder="Campaign title" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Category</label>
                  <select value={newAd.category} onChange={(e) => setNewAd(p => ({ ...p, category: e.target.value as any }))} className="w-full h-10 rounded-md bg-gray-800 border border-gray-700 text-white px-3">
                    <option value="commercial">Commercial</option>
                    <option value="psa">PSA</option>
                    <option value="promo">Promo</option>
                    <option value="sponsor">Sponsor</option>
                    <option value="community">Community</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Duration (sec)</label>
                  <Input type="number" value={newAd.durationSeconds} onChange={(e) => setNewAd(p => ({ ...p, durationSeconds: Number(e.target.value) }))} className="bg-gray-800 border-gray-700" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Rotation Weight (1-10)</label>
                  <Input type="number" min={1} max={10} value={newAd.rotationWeight} onChange={(e) => setNewAd(p => ({ ...p, rotationWeight: Number(e.target.value) }))} className="bg-gray-800 border-gray-700" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Time Start</label>
                  <Input type="time" value={newAd.timeSlotStart} onChange={(e) => setNewAd(p => ({ ...p, timeSlotStart: e.target.value }))} className="bg-gray-800 border-gray-700" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Time End</label>
                  <Input type="time" value={newAd.timeSlotEnd} onChange={(e) => setNewAd(p => ({ ...p, timeSlotEnd: e.target.value }))} className="bg-gray-800 border-gray-700" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Target Channels (comma-separated IDs or "all")</label>
                <Input value={newAd.targetChannels} onChange={(e) => setNewAd(p => ({ ...p, targetChannels: e.target.value }))} className="bg-gray-800 border-gray-700" placeholder="all" />
              </div>
              <Button
                className="bg-gradient-to-r from-purple-600 to-amber-600"
                onClick={() => createMutation.mutate(newAd)}
                disabled={createMutation.isPending || !newAd.sponsorName || !newAd.campaignName}
              >
                {createMutation.isPending ? "Creating..." : "Create Ad"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ad Inventory List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" /> Ad Inventory ({ads.length})
          </h2>
          {ads.length === 0 ? (
            <Card className="bg-gray-900/60 border-purple-500/20">
              <CardContent className="py-12 text-center">
                <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No ads in rotation. Click "Seed Default Ads" to populate with initial inventory.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ads.map((ad) => (
                <Card key={ad.id} className="bg-gray-900/60 border-purple-500/20">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-12 rounded-full ${ad.active ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{ad.sponsorName}</span>
                            <Badge className={CATEGORY_COLORS[ad.category || "commercial"]} variant="outline">
                              {ad.category}
                            </Badge>
                            <Badge variant="outline" className="border-gray-600 text-gray-400">
                              W:{ad.rotationWeight}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">{ad.campaignName}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ad.durationSeconds}s</span>
                            <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {ad.totalPlays} plays</span>
                            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {ad.targetChannels || 'all'}</span>
                            {ad.timeSlotStart && <span>{ad.timeSlotStart}-{ad.timeSlotEnd}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={ad.active ? "border-amber-500/30 text-amber-400" : "border-emerald-500/30 text-emerald-400"}
                          onClick={() => updateMutation.mutate({ id: ad.id, active: !ad.active })}
                        >
                          {ad.active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                          onClick={() => deleteMutation.mutate(ad.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Top Sponsors */}
        {stats?.topSponsors && stats.topSponsors.length > 0 && (
          <Card className="bg-gray-900/60 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" /> Top Sponsors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topSponsors.map((sponsor, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-purple-400">#{i + 1}</span>
                      <span className="text-white font-semibold">{sponsor.sponsorName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{sponsor.campaignCount} campaigns</span>
                      <span className="text-amber-400 font-bold">{sponsor.totalPlays?.toLocaleString()} plays</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-purple-500/10">
          <p className="text-xs text-gray-500">
            Canryn Production — QUMUS Autonomous Ad Rotation Engine
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Ads are automatically rotated across all 50 RRB channels based on weight, time-slot, and channel targeting.
          </p>
        </div>
      </div>
    </div>
  );
}
