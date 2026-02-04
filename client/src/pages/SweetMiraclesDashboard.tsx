import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Gift, AlertCircle, DollarSign, TrendingUp } from "lucide-react";

const DONATION_TIERS = [
  {
    name: "Bronze",
    amount: 25,
    color: "from-amber-600 to-amber-700",
    benefits: ["Monthly recognition", "Impact updates"],
  },
  {
    name: "Silver",
    amount: 50,
    color: "from-gray-400 to-gray-500",
    benefits: ["Monthly recognition", "Impact updates", "Quarterly reports"],
  },
  {
    name: "Gold",
    amount: 100,
    color: "from-yellow-400 to-yellow-600",
    benefits: ["All Silver benefits", "Exclusive events", "Direct impact tracking"],
  },
  {
    name: "Platinum",
    amount: 250,
    color: "from-purple-500 to-purple-700",
    benefits: ["All Gold benefits", "VIP status", "Quarterly calls with leadership"],
  },
];

export default function SweetMiraclesDashboard() {
  const [selectedTier, setSelectedTier] = useState<string>("silver");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDonate = async (tier: string) => {
    setIsProcessing(true);
    try {
      const amount = tier === "custom" ? parseFloat(customAmount) : DONATION_TIERS.find((t) => t.name.toLowerCase() === tier)?.amount || 50;

      if (!amount || amount < 1) {
        alert("Please enter a valid donation amount");
        setIsProcessing(false);
        return;
      }

      // In production, this would call the Stripe checkout endpoint
      alert(`Donation of $${amount} initiated. Redirecting to Stripe checkout...`);
      // window.location.href = `/api/stripe/checkout?amount=${Math.round(amount * 100)}&tier=${tier}`;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Sweet Miracles</h1>
          <p className="text-xl text-gray-600">A Voice for the Voiceless</p>
          <p className="text-gray-500 mt-2">Supporting seniors and vulnerable populations</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-l-4 border-l-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Raised</p>
                <p className="text-3xl font-bold text-green-700">$127,450</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Donors</p>
                <p className="text-3xl font-bold text-blue-700">1,284</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Available Grants</p>
                <p className="text-3xl font-bold text-purple-700">23</p>
              </div>
              <Gift className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Alerts</p>
                <p className="text-3xl font-bold text-red-700">8</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="donate" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="donate">💝 Donate</TabsTrigger>
            <TabsTrigger value="donors">👥 Donors</TabsTrigger>
            <TabsTrigger value="grants">🎁 Grants</TabsTrigger>
            <TabsTrigger value="alerts">🚨 Alerts</TabsTrigger>
            <TabsTrigger value="wellness">💚 Wellness</TabsTrigger>
            <TabsTrigger value="campaigns">📊 Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          </TabsList>

          {/* Donate Tab */}
          <TabsContent value="donate" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Donation Tier</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {DONATION_TIERS.map((tier) => (
                  <Card
                    key={tier.name}
                    className={`p-6 cursor-pointer transition-all ${
                      selectedTier === tier.name.toLowerCase()
                        ? "ring-2 ring-green-600 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedTier(tier.name.toLowerCase())}
                  >
                    <div className={`bg-gradient-to-br ${tier.color} text-white rounded-lg p-4 mb-4`}>
                      <h3 className="text-xl font-bold">{tier.name}</h3>
                      <p className="text-2xl font-bold mt-2">${tier.amount}/mo</p>
                    </div>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>

              {/* Custom Amount */}
              <Card className="p-6 bg-blue-50 border-blue-200 mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Or make a custom donation</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USD)</label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      min="1"
                      step="0.01"
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => handleDonate("custom")}
                      disabled={isProcessing || !customAmount}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? "Processing..." : "Donate Custom"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Donate Button */}
              <Button
                onClick={() => handleDonate(selectedTier)}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg font-bold"
              >
                {isProcessing ? "Processing..." : `Donate $${DONATION_TIERS.find((t) => t.name.toLowerCase() === selectedTier)?.amount || ""}/month`}
              </Button>
            </div>
          </TabsContent>

          {/* Other Tabs - Placeholder Content */}
          <TabsContent value="donors" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Top Donors</h3>
              <p className="text-gray-600">Coming soon - Donor recognition and management</p>
            </Card>
          </TabsContent>

          <TabsContent value="grants" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Grant Opportunities</h3>
              <p className="text-gray-600">Coming soon - AI-powered grant discovery and matching</p>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Emergency Alerts</h3>
              <p className="text-gray-600">Coming soon - Multi-region emergency broadcasting</p>
            </Card>
          </TabsContent>

          <TabsContent value="wellness" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Wellness Check-In</h3>
              <p className="text-gray-600">Coming soon - "I'm Okay" system for seniors</p>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Fundraising Campaigns</h3>
              <p className="text-gray-600">Coming soon - Campaign tracking and impact metrics</p>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Analytics & Reports</h3>
              <p className="text-gray-600">Coming soon - Detailed analytics and reporting</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
