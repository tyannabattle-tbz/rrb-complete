/**
 * Radio Directory Listing Page — Canryn Production
 * Manage radio station presence across global directories
 * RadioBrowser API auto-registration, submission tracking, stream health
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Radio, ArrowLeft, Globe, CheckCircle, XCircle, Clock, ExternalLink,
  Wifi, WifiOff, Send, RefreshCw, Music, MapPin, Zap,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function RadioDirectory() {
  
  const [activeTab, setActiveTab] = useState("profile");
  const [showRegister, setShowRegister] = useState(false);

  // Station profile form
  const [profileForm, setProfileForm] = useState({
    stationName: "Rockin' Rockin' Boogie Radio",
    tagline: "A Canryn Production — Voice for the Voiceless",
    description: "Rockin' Rockin' Boogie Radio is a multi-genre internet radio station by Canryn Production, featuring R&B, Soul, Gospel, Jazz, Blues, Hip-Hop, and healing frequencies. Home of the Seabrun Candy Hunter legacy and Sweet Miracles Foundation.",
    genre: "R&B, Soul, Gospel, Jazz, Blues, Hip-Hop",
    tags: "rnb,soul,gospel,jazz,blues,hiphop,healing,solfeggio,canryn,legacy",
    streamUrl: "",
    websiteUrl: "",
    logoUrl: "",
    country: "United States",
    countryCode: "US",
    state: "",
    city: "",
    language: "English",
    languageCode: "en",
    contactEmail: "",
  });

  const directoriesQuery = trpc.radioDirectory.getDirectories.useQuery();
  const profileQuery = trpc.radioDirectory.getStationProfile.useQuery();
  const trackingQuery = trpc.radioDirectory.getSubmissionTracking.useQuery();

  const utils = trpc.useUtils();

  const saveProfileMut = trpc.radioDirectory.saveStationProfile.useMutation({
    onSuccess: () => {
      toast.success("Station profile saved");
      utils.radioDirectory.getStationProfile.invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const registerMut = trpc.radioDirectory.registerOnRadioBrowser.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Registered on RadioBrowser! UUID: ${data.uuid}`);
        // Track the submission
        trackMut.mutate({
          directoryId: "radiobrowser",
          directoryName: "RadioBrowser",
          status: "listed",
          notes: `UUID: ${data.uuid}`,
        });
      } else {
        toast.error(`Registration issue: ${data.message}`);
      }
      setShowRegister(false);
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const trackMut = trpc.radioDirectory.trackSubmission.useMutation({
    onSuccess: () => utils.radioDirectory.getSubmissionTracking.invalidate(),
  });

  const directories = directoriesQuery.data ?? [];
  const submissions = trackingQuery.data ?? [];
  const profile = profileQuery.data;

  // Merge directory catalog with submission tracking
  const directoryStatus = directories.map((dir: any) => {
    const sub = submissions.find((s: any) => s.directory_id === dir.id || s.directoryId === dir.id);
    return {
      ...dir,
      submissionStatus: sub?.status ?? "not_submitted",
      listingUrl: sub?.listing_url ?? sub?.listingUrl,
      notes: sub?.notes,
    };
  });

  const listedCount = directoryStatus.filter((d: any) => d.submissionStatus === "listed" || d.submissionStatus === "approved").length;
  const submittedCount = directoryStatus.filter((d: any) => d.submissionStatus === "submitted" || d.submissionStatus === "pending").length;

  const statusIcons: Record<string, any> = {
    listed: <CheckCircle className="w-4 h-4 text-green-400" />,
    approved: <CheckCircle className="w-4 h-4 text-green-400" />,
    submitted: <Clock className="w-4 h-4 text-amber-400" />,
    pending: <Clock className="w-4 h-4 text-amber-400" />,
    rejected: <XCircle className="w-4 h-4 text-red-400" />,
    not_submitted: <Globe className="w-4 h-4 text-muted-foreground" />,
  };

  const statusLabels: Record<string, string> = {
    listed: "Listed",
    approved: "Approved",
    submitted: "Submitted",
    pending: "Pending",
    rejected: "Rejected",
    not_submitted: "Not Submitted",
  };

  const statusColors: Record<string, string> = {
    listed: "bg-green-500/20 text-green-300",
    approved: "bg-green-500/20 text-green-300",
    submitted: "bg-amber-500/20 text-amber-300",
    pending: "bg-amber-500/20 text-amber-300",
    rejected: "bg-red-500/20 text-red-300",
    not_submitted: "bg-gray-500/20 text-gray-300",
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Radio className="w-6 h-6 text-orange-400" />
        <h1 className="text-2xl font-bold">Radio Directory Listing</h1>
        <span className="text-sm text-muted-foreground">Get Listed Worldwide</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-400" /> Listed
            </div>
            <div className="text-2xl font-bold text-green-400">{listedCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-amber-400" /> Pending
            </div>
            <div className="text-2xl font-bold text-amber-400">{submittedCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" /> Directories
            </div>
            <div className="text-2xl font-bold">{directories.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-blue-400" /> Auto-Register
            </div>
            <div className="text-2xl font-bold">RadioBrowser</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Station Profile</TabsTrigger>
          <TabsTrigger value="directories">Directories ({directories.length})</TabsTrigger>
          <TabsTrigger value="health">Stream Health</TabsTrigger>
        </TabsList>

        {/* Station Profile */}
        <TabsContent value="profile">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" /> Station Branding & Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This profile is used when submitting to radio directories. Keep it accurate and compelling.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Station Name</label>
                    <Input value={profileForm.stationName} onChange={(e) => setProfileForm((p) => ({ ...p, stationName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Tagline</label>
                    <Input value={profileForm.tagline} onChange={(e) => setProfileForm((p) => ({ ...p, tagline: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Genre</label>
                    <Input value={profileForm.genre} onChange={(e) => setProfileForm((p) => ({ ...p, genre: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Tags (comma-separated)</label>
                    <Input value={profileForm.tags} onChange={(e) => setProfileForm((p) => ({ ...p, tags: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Stream URL</label>
                    <Input placeholder="https://stream.example.com/live" value={profileForm.streamUrl} onChange={(e) => setProfileForm((p) => ({ ...p, streamUrl: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Website URL</label>
                    <Input value={profileForm.websiteUrl} onChange={(e) => setProfileForm((p) => ({ ...p, websiteUrl: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Country</label>
                    <Input value={profileForm.country} onChange={(e) => setProfileForm((p) => ({ ...p, country: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Country Code (2-letter)</label>
                    <Input maxLength={2} value={profileForm.countryCode} onChange={(e) => setProfileForm((p) => ({ ...p, countryCode: e.target.value.toUpperCase() }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">State</label>
                    <Input value={profileForm.state} onChange={(e) => setProfileForm((p) => ({ ...p, state: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">City</label>
                    <Input value={profileForm.city} onChange={(e) => setProfileForm((p) => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Language</label>
                    <Input value={profileForm.language} onChange={(e) => setProfileForm((p) => ({ ...p, language: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Contact Email</label>
                    <Input type="email" value={profileForm.contactEmail} onChange={(e) => setProfileForm((p) => ({ ...p, contactEmail: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea rows={3} value={profileForm.description} onChange={(e) => setProfileForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <Button
                className="w-full"
                disabled={!profileForm.stationName || !profileForm.streamUrl || saveProfileMut.isPending}
                onClick={() => saveProfileMut.mutate(profileForm)}
              >
                {saveProfileMut.isPending ? "Saving..." : "Save Station Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Directories */}
        <TabsContent value="directories">
          <div className="space-y-3">
            {directoryStatus.map((dir: any) => (
              <Card key={dir.id} className="bg-card hover:bg-accent/5 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      {statusIcons[dir.submissionStatus]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dir.name}</span>
                        <Badge className={statusColors[dir.submissionStatus] ?? ""}>
                          {statusLabels[dir.submissionStatus] ?? dir.submissionStatus}
                        </Badge>
                        {dir.submissionType === "api" && (
                          <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                            <Zap className="w-3 h-3 mr-1" /> Auto
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{dir.description}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        Reach: {dir.reach}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dir.submissionStatus === "not_submitted" && dir.submissionType === "api" && (
                        <Dialog open={showRegister} onOpenChange={setShowRegister}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-1">
                              <Zap className="w-3 h-3" /> Auto-Register
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Register on RadioBrowser</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-muted-foreground">
                                This will programmatically register your station on the RadioBrowser community directory,
                                which is used by VLC, Kodi, and hundreds of other apps worldwide.
                              </p>
                              <div className="bg-accent/10 p-3 rounded-lg text-sm space-y-1">
                                <div><strong>Name:</strong> {profileForm.stationName}</div>
                                <div><strong>Stream:</strong> {profileForm.streamUrl || "Not set — save profile first"}</div>
                                <div><strong>Genre:</strong> {profileForm.genre}</div>
                                <div><strong>Country:</strong> {profileForm.country} ({profileForm.countryCode})</div>
                              </div>
                              <Button
                                className="w-full"
                                disabled={!profileForm.streamUrl || registerMut.isPending}
                                onClick={() => registerMut.mutate({
                                  name: profileForm.stationName,
                                  url: profileForm.streamUrl,
                                  homepage: profileForm.websiteUrl || undefined,
                                  countrycode: profileForm.countryCode || undefined,
                                  languagecodes: profileForm.languageCode || undefined,
                                  tags: profileForm.tags || undefined,
                                })}
                              >
                                {registerMut.isPending ? "Registering..." : "Register Now"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {dir.submissionStatus === "not_submitted" && dir.submissionType === "manual" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => window.open(dir.submissionUrl, "_blank")}
                          >
                            <ExternalLink className="w-3 h-3" /> Submit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => trackMut.mutate({
                              directoryId: dir.id,
                              directoryName: dir.name,
                              status: "submitted",
                            })}
                          >
                            <Send className="w-3 h-3 mr-1" /> Mark Submitted
                          </Button>
                        </div>
                      )}
                      {dir.submissionStatus === "submitted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-400"
                          onClick={() => trackMut.mutate({
                            directoryId: dir.id,
                            directoryName: dir.name,
                            status: "listed",
                          })}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Mark Listed
                        </Button>
                      )}
                      {dir.listingUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(dir.listingUrl, "_blank")}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {dir.instructions && dir.submissionStatus === "not_submitted" && (
                    <div className="mt-3 p-3 bg-accent/5 rounded-lg text-xs text-muted-foreground">
                      <strong>How to submit:</strong> {dir.instructions}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Stream Health */}
        <TabsContent value="health">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" /> Stream Health Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Directories automatically remove stations with dead streams. Monitor your stream uptime here.
                Enter your stream URL in the Station Profile tab first.
              </p>
              {profileForm.streamUrl ? (
                <StreamHealthCheck streamUrl={profileForm.streamUrl} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <WifiOff className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Set your stream URL in the Station Profile tab to enable health monitoring.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StreamHealthCheck({ streamUrl }: { streamUrl: string }) {
  const healthQuery = trpc.radioDirectory.checkStreamHealth.useQuery(
    { streamUrl },
    { refetchInterval: 60000 }
  );

  const health = healthQuery.data;

  if (healthQuery.isLoading) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <RefreshCw className="w-4 h-4 animate-spin" /> Checking stream health...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-3 p-4 rounded-lg ${health?.isUp ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
        {health?.isUp ? (
          <Wifi className="w-6 h-6 text-green-400" />
        ) : (
          <WifiOff className="w-6 h-6 text-red-400" />
        )}
        <div>
          <div className="font-medium">{health?.isUp ? "Stream is UP" : "Stream is DOWN"}</div>
          <div className="text-xs text-muted-foreground">
            Status: {health?.statusCode} · Checked: {health?.checkedAt ? new Date(health.checkedAt).toLocaleTimeString() : "—"}
          </div>
        </div>
      </div>

      {health?.isUp && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-accent/5 rounded-lg">
            <div className="text-xs text-muted-foreground">Content Type</div>
            <div className="text-sm font-mono">{health.contentType ?? "—"}</div>
          </div>
          <div className="p-3 bg-accent/5 rounded-lg">
            <div className="text-xs text-muted-foreground">Station Name</div>
            <div className="text-sm">{health.icyName ?? "—"}</div>
          </div>
          <div className="p-3 bg-accent/5 rounded-lg">
            <div className="text-xs text-muted-foreground">Genre</div>
            <div className="text-sm">{health.icyGenre ?? "—"}</div>
          </div>
          <div className="p-3 bg-accent/5 rounded-lg">
            <div className="text-xs text-muted-foreground">Bitrate</div>
            <div className="text-sm">{health.icyBitrate ? `${health.icyBitrate} kbps` : "—"}</div>
          </div>
        </div>
      )}

      {health?.error && (
        <div className="p-3 bg-red-500/10 rounded-lg text-sm text-red-400">
          Error: {health.error}
        </div>
      )}
    </div>
  );
}
