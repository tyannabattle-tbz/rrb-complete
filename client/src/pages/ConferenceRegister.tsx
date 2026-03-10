import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Check, Download, Globe, MapPin, Shield, Star, Users, Accessibility } from "lucide-react";

export default function ConferenceRegister() {
  const params = useParams<{ id: string }>();
  const conferenceId = parseInt(params.id || "0");
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [ticketType, setTicketType] = useState<"general" | "vip" | "speaker" | "delegate">("general");
  const [accessibilityNeeds, setAccessibilityNeeds] = useState("");
  const [dietaryNeeds, setDietaryNeeds] = useState("");
  const [icsContent, setIcsContent] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const { data: regInfo, isLoading } = trpc.conference.getRegistrationInfo.useQuery(
    { conferenceId },
    { enabled: conferenceId > 0 }
  );

  const registerMutation = trpc.conference.registerAttendee.useMutation({
    onSuccess: (data) => {
      setRegistered(true);
      setIcsContent(data.icsCalendarInvite);
      toast({
        title: "Registration Successful!",
        description: data.message,
      });
    },
    onError: (err) => {
      toast({
        title: "Registration Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    registerMutation.mutate({
      conferenceId,
      name,
      email,
      organization: organization || undefined,
      ticketType,
      accessibilityNeeds: accessibilityNeeds || undefined,
      dietaryNeeds: dietaryNeeds || undefined,
    });
  };

  const downloadICS = () => {
    if (!icsContent) return;
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conference-${conferenceId}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ticketTiers = [
    { id: "general" as const, label: "General Admission", price: "Free", icon: Users, color: "border-green-500", perks: ["Join conference", "Chat access", "Recording access"] },
    { id: "vip" as const, label: "VIP Access", price: "$49.99", icon: Star, color: "border-yellow-500", perks: ["Priority join", "Speaker Q&A", "Exclusive recordings", "VIP badge"] },
    { id: "speaker" as const, label: "Speaker Pass", price: "$99.99", icon: Globe, color: "border-blue-500", perks: ["Present & share screen", "Extended time", "Speaker profile", "All VIP perks"] },
    { id: "delegate" as const, label: "UN Delegate Pass", price: "$149.99", icon: Shield, color: "border-purple-500", perks: ["Delegate credentials", "All sessions access", "Networking priority", "All Speaker perks"] },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-purple-400">Loading registration...</div>
      </div>
    );
  }

  if (!regInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Conference Not Found</h2>
          <Link href="/conference">
            <Button variant="outline" className="border-purple-500 text-purple-400">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Conference Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <Card className="bg-gray-900/80 border-green-500/50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-white">Registration Confirmed!</CardTitle>
              <CardDescription className="text-gray-400">
                You're registered for <span className="text-purple-400 font-semibold">{regInfo.title}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-400">Conference Details</p>
                <p className="text-white font-medium">{regInfo.title}</p>
                <p className="text-gray-400 text-sm">Room: {regInfo.room_code} | Platform: {regInfo.platform}</p>
                {regInfo.scheduled_at && (
                  <p className="text-gray-400 text-sm">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(regInfo.scheduled_at).toLocaleString()}
                  </p>
                )}
                <p className="text-purple-400 text-sm font-medium">Ticket: {ticketType.toUpperCase()}</p>
              </div>

              <div className="flex gap-3">
                {icsContent && (
                  <Button onClick={downloadICS} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Download className="w-4 h-4 mr-2" /> Download Calendar Invite (.ics)
                  </Button>
                )}
                <Link href={`/conference/room/${conferenceId}`}>
                  <Button variant="outline" className="border-green-500 text-green-400">
                    Enter Conference
                  </Button>
                </Link>
              </div>

              <div className="text-center pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500">Powered by QUMUS Autonomous Orchestration | Canryn Production</p>
                <p className="text-xs text-purple-400 mt-1">A Voice for the Voiceless</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-4">
          <Link href="/conference">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Register for Conference</h1>
            <p className="text-purple-400">{regInfo.title}</p>
          </div>
        </div>

        {/* Conference Info Banner */}
        <Card className="bg-gray-900/60 border-purple-500/30 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Type</p>
                <p className="text-white font-medium">{regInfo.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Platform</p>
                <p className="text-white font-medium">{regInfo.platform}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Host</p>
                <p className="text-white font-medium">{regInfo.host_name || "QUMUS"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Spots Remaining</p>
                <p className={`font-medium ${regInfo.isFull ? "text-red-400" : "text-green-400"}`}>
                  {regInfo.isFull ? "FULL" : regInfo.spotsRemaining}
                </p>
              </div>
            </div>
            {regInfo.scheduled_at && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {new Date(regInfo.scheduled_at).toLocaleString("en-US", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                  {regInfo.duration_minutes && ` (${regInfo.duration_minutes} min)`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ticket Selection */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Select Ticket Tier</h2>
            {ticketTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <button
                  key={tier.id}
                  onClick={() => setTicketType(tier.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    ticketType === tier.id
                      ? `${tier.color} bg-gray-800/80`
                      : "border-gray-700 bg-gray-900/40 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${ticketType === tier.id ? "text-purple-400" : "text-gray-500"}`} />
                    <span className="text-white font-medium">{tier.label}</span>
                    <span className={`ml-auto text-sm font-bold ${tier.price === "Free" ? "text-green-400" : "text-yellow-400"}`}>
                      {tier.price}
                    </span>
                  </div>
                  <ul className="space-y-1 ml-8">
                    {tier.perks.map((perk, i) => (
                      <li key={i} className="text-xs text-gray-400 flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-500" /> {perk}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/60 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Registration Form</CardTitle>
                <CardDescription className="text-gray-400">
                  Fill in your details to register. Calendar invite will be generated automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Full Name *</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Email Address *</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Organization / Affiliation</label>
                    <Input
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g., United Nations, NGO name, Company"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                      <Accessibility className="w-4 h-4 text-blue-400" />
                      Accessibility Needs
                    </label>
                    <Textarea
                      value={accessibilityNeeds}
                      onChange={(e) => setAccessibilityNeeds(e.target.value)}
                      placeholder="Sign language interpretation, screen reader support, captioning, mobility assistance, etc."
                      className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We are committed to inclusive design. All conferences include live captions by default.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Dietary Needs (for in-person events)</label>
                    <Input
                      value={dietaryNeeds}
                      onChange={(e) => setDietaryNeeds(e.target.value)}
                      placeholder="Vegetarian, vegan, halal, kosher, allergies, etc."
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Selected Ticket</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">
                        {ticketTiers.find(t => t.id === ticketType)?.label}
                      </span>
                      <span className={`font-bold ${ticketType === "general" ? "text-green-400" : "text-yellow-400"}`}>
                        {ticketTiers.find(t => t.id === ticketType)?.price}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={registerMutation.isPending || regInfo.isFull}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
                  >
                    {registerMutation.isPending ? "Registering..." : regInfo.isFull ? "Conference Full" : "Register Now"}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    By registering, you agree to the conference terms. Powered by Canryn Production | A Voice for the Voiceless
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
