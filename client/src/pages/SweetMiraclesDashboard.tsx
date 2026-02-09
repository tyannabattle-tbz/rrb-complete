"use client";

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Gift, AlertCircle, DollarSign, TrendingUp } from "lucide-react";

const DONATION_TIERS = [
  {
    name: "Bronze",
    amount: 25,
    priceId: "price_1SxEcmRzKOILZyAN7PCozzkE",
    color: "from-amber-600 to-amber-700",
    benefits: ["Monthly recognition", "Impact updates"],
  },
  {
    name: "Silver",
    amount: 50,
    priceId: "price_1SxEfHRzKOILZyANZJPXhNPW",
    color: "from-gray-400 to-gray-500",
    benefits: ["Monthly recognition", "Impact updates", "Quarterly reports"],
  },
  {
    name: "Gold",
    amount: 100,
    priceId: "price_1SxEepRzKOILZyAN6cPbC8l6",
    color: "from-yellow-400 to-yellow-600",
    benefits: ["All Silver benefits", "Exclusive events", "Direct impact tracking"],
  },
  {
    name: "Platinum",
    amount: 250,
    priceId: "price_1SxEeWRzKOILZyANC2OBc4NS",
    color: "from-purple-500 to-purple-700",
    benefits: ["All Gold benefits", "VIP status", "Quarterly calls with leadership"],
  },
];

export default function SweetMiraclesDashboard() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string>("silver");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDonate = async (tier: string) => {
    if (!user) {
      alert("Please log in to make a donation.");
      return;
    }

    setIsProcessing(true);
    try {
      if (tier === "custom") {
        const amount = parseFloat(customAmount);
        if (!amount || amount < 0.5) {
          alert("Please enter a valid donation amount (minimum $0.50).");
          setIsProcessing(false);
          return;
        }

        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            tier: "custom",
          }),
        });

        const { url } = await response.json();
        if (url) {
          // Redirecting to checkout
          window.open(url, "_blank");
        }
      } else {
        const tierData = DONATION_TIERS.find((t) => t.name.toLowerCase() === tier);
        if (!tierData) {
          alert("Invalid tier selected.");
          return;
        }

        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: tierData.priceId,
            tier: tier,
          }),
        });

        const { url } = await response.json();
        if (url) {
          // Redirecting to checkout
          window.open(url, "_blank");
        }
      }
    } catch (error) {
      console.error("Donation error:", error);
      alert("Error processing donation. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-green-900 mb-1 sm:mb-2">Sweet Miracles</h1>
          <p className="text-base sm:text-xl text-gray-600">A Voice for the Voiceless</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Supporting seniors and vulnerable populations</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-6 border-l-4 border-l-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Total Raised</p>
                <p className="text-xl sm:text-3xl font-bold text-green-700">$127,450</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Active Donors</p>
                <p className="text-xl sm:text-3xl font-bold text-blue-700">1,284</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-l-4 border-l-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Available Grants</p>
                <p className="text-xl sm:text-3xl font-bold text-purple-700">23</p>
              </div>
              <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-l-4 border-l-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Lives Impacted</p>
                <p className="text-xl sm:text-3xl font-bold text-orange-700">3,847</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="donate" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8">
            <TabsTrigger value="donate" className="text-xs sm:text-base">Make a Donation</TabsTrigger>
            <TabsTrigger value="impact" className="text-xs sm:text-base">Our Impact</TabsTrigger>
            <TabsTrigger value="about" className="text-xs sm:text-base">About Us</TabsTrigger>
          </TabsList>

          <TabsContent value="donate" className="space-y-6 sm:space-y-8">
            {/* Donation Tiers */}
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Choose Your Impact Level</h2>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {DONATION_TIERS.map((tier) => (
                  <Card
                    key={tier.name}
                    className={`p-3 sm:p-6 cursor-pointer transition-all ${
                      selectedTier === tier.name.toLowerCase()
                        ? "ring-2 ring-green-500 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedTier(tier.name.toLowerCase())}
                  >
                    <div className={`bg-gradient-to-br ${tier.color} text-white p-3 sm:p-4 rounded-lg mb-3 sm:mb-4`}>
                      <h3 className="text-base sm:text-xl font-bold">{tier.name}</h3>
                      <p className="text-xs sm:text-sm opacity-90">${tier.amount}/month</p>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {tier.benefits.map((benefit) => (
                        <li key={benefit} className="text-sm text-gray-600 flex items-start">
                          <Heart className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleDonate(tier.name.toLowerCase())}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? "Processing..." : "Donate"}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            {/* Custom Donation */}
            <Card className="p-4 sm:p-8 bg-white">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Custom Donation</h3>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Enter Amount ($)
                  </label>
                  <Input
                    type="number"
                    min="0.50"
                    step="0.01"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => handleDonate("custom")}
                    disabled={isProcessing || !customAmount}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? "Processing..." : "Donate Custom Amount"}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Minimum donation: $0.50</p>
            </Card>

            {/* Payment Info */}
            <Card className="p-6 bg-blue-50 border-l-4 border-l-blue-500">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Secure Payment</h4>
                  <p className="text-sm text-blue-800">
                    All donations are processed securely through Stripe. Your payment information is never stored on our servers.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Impact</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Sweet Miracles has been transforming lives since 2022. Through the generosity of donors like you, we have:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-3">✓</span>
                    <span>Provided emergency assistance to over 3,800 seniors and vulnerable individuals</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-3">✓</span>
                    <span>Conducted 5,200+ wellness check-ins to ensure safety and well-being</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-3">✓</span>
                    <span>Distributed $127,450 in direct aid and support services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-3">✓</span>
                    <span>Built a community of 1,284 active supporters</span>
                  </li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">About Sweet Miracles</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Sweet Miracles NPO is a 501(c)(3) registered nonprofit organization dedicated to providing compassionate support to seniors and vulnerable populations in our community.
                </p>
                <p>
                  Our mission is to be a voice for the voiceless, ensuring that every senior receives the care, respect, and assistance they deserve. We believe that everyone deserves dignity and support, regardless of their circumstances.
                </p>
                <p>
                  Through emergency assistance, wellness check-ins, and community support programs, we work to improve the quality of life for those who need it most.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
