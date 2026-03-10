import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, QrCode, Scan, Users, Clock, Shield, AlertTriangle } from "lucide-react";

export default function ConferenceCheckIn() {
  const params = useParams<{ id: string }>();
  const conferenceId = parseInt(params.id || "0");
  const { toast } = useToast();
  const [qrInput, setQrInput] = useState("");
  const [lastCheckedIn, setLastCheckedIn] = useState<any>(null);

  const { data: dashboard, refetch } = trpc.conference.getCheckInDashboard.useQuery(
    { conferenceId },
    { refetchInterval: 5000 }
  );

  const checkInMutation = trpc.conference.checkIn.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setLastCheckedIn(data.attendee);
        toast({ title: "Checked In!", description: `${data.attendee?.name} has been checked in to ${data.conferenceTitle}` });
        setQrInput("");
        refetch();
      } else {
        toast({ title: "Check-In Failed", description: data.error, variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process check-in", variant: "destructive" });
    },
  });

  const handleCheckIn = () => {
    if (!qrInput.trim()) return;
    checkInMutation.mutate({ qrCode: qrInput.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-green-950/20 to-gray-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/conference">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-1" /> Conference Hub
              </Button>
            </Link>
            <div className="h-4 w-px bg-white/20" />
            <h1 className="text-lg font-semibold text-white flex items-center gap-2">
              <Scan className="w-5 h-5 text-green-400" /> Check-In Dashboard
            </h1>
          </div>
          {dashboard && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-green-400">{dashboard.arrivalRate}% Arrival Rate</span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* QR Scanner Input */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="shrink-0">
                <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-white font-semibold mb-2">Scan QR Code or Enter Code</h3>
                <div className="flex gap-2">
                  <Input
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="Enter QR code (e.g., CONF-CHK-...)"
                    className="bg-white/5 border-white/20 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
                    aria-label="QR code input for attendee check-in"
                  />
                  <Button
                    onClick={handleCheckIn}
                    disabled={!qrInput.trim() || checkInMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    {checkInMutation.isPending ? 'Checking...' : 'Check In'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Last Checked In */}
            {lastCheckedIn && (
              <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <p className="text-green-400 font-medium">{lastCheckedIn.name}</p>
                  <p className="text-green-400/60 text-sm">{lastCheckedIn.email} &bull; {lastCheckedIn.ticket_type} &bull; {lastCheckedIn.organization || 'No org'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{dashboard?.total || 0}</p>
              <p className="text-white/40 text-sm">Registered</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{dashboard?.checkedIn || 0}</p>
              <p className="text-white/40 text-sm">Checked In</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{(dashboard?.total || 0) - (dashboard?.checkedIn || 0)}</p>
              <p className="text-white/40 text-sm">Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <Shield className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{dashboard?.arrivalRate || 0}%</p>
              <p className="text-white/40 text-sm">Arrival Rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tier Breakdown */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Ticket Tier Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.tierBreakdown && dashboard.tierBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.tierBreakdown.map((tier: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          tier.ticket_type === 'delegate' ? 'bg-blue-500/20 text-blue-400' :
                          tier.ticket_type === 'speaker' ? 'bg-amber-500/20 text-amber-400' :
                          tier.ticket_type === 'vip' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {tier.ticket_type?.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-green-400 font-medium">{tier.checked_in || 0}</span>
                        <span className="text-white/40"> / {tier.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-center py-4">No registrations yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Arrivals */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Recent Arrivals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.recentArrivals && dashboard.recentArrivals.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {dashboard.recentArrivals.map((arrival: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-sm">
                      <div>
                        <p className="text-white font-medium">{arrival.name}</p>
                        <p className="text-white/40 text-xs">{arrival.organization || arrival.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          arrival.ticket_type === 'delegate' ? 'bg-blue-500/20 text-blue-400' :
                          arrival.ticket_type === 'vip' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {arrival.ticket_type}
                        </span>
                        <p className="text-white/30 text-xs mt-0.5">
                          {arrival.checked_in_at ? new Date(arrival.checked_in_at).toLocaleTimeString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-amber-400/30 mx-auto mb-2" />
                  <p className="text-white/40">No check-ins yet</p>
                  <p className="text-white/20 text-sm">Scan a QR code to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/30 text-xs">
            QUMUS Conference Check-In System | Auto-refreshes every 5 seconds | Canryn Production
          </p>
        </div>
      </div>
    </div>
  );
}
