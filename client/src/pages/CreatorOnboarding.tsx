import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

type OnboardingStep = "welcome" | "profile" | "payout" | "tax" | "complete";

export default function CreatorOnboarding() {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    payoutMethod: "bank",
    bankAccount: "",
    taxId: "",
    country: "",
  });

  const steps: OnboardingStep[] = ["welcome", "profile", "payout", "tax", "complete"];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const handlePrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Creator Setup</h1>
            <span className="text-sm text-gray-600">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Welcome Step */}
        {step === "welcome" && (
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Creator Program</h2>
              <p className="text-gray-600">
                Set up your creator profile and start earning from your videos. This process takes about 5 minutes.
              </p>
            </div>
            <div className="space-y-3 text-left bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Complete your creator profile</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Set up payment method</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Add tax information</span>
              </div>
            </div>
            <Button onClick={handleNext} className="w-full">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        )}

        {/* Profile Step */}
        {step === "profile" && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Creator Profile</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Your creator name"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  placeholder="Tell us about yourself and your content"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handlePrev} variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Payout Step */}
        {step === "payout" && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="payoutMethod">Payout Method</Label>
                <Select value={formData.payoutMethod} onValueChange={(value) => handleInputChange("payoutMethod", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bankAccount">Bank Account / Payment ID</Label>
                <Input
                  id="bankAccount"
                  placeholder="Enter your account details"
                  value={formData.bankAccount}
                  onChange={(e) => handleInputChange("bankAccount", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Your payment information is encrypted and secure. We never share it with third parties.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handlePrev} variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tax Step */}
        {step === "tax" && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tax Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="taxId">Tax ID / SSN</Label>
                <Input
                  id="taxId"
                  placeholder="Your tax identification number"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange("taxId", e.target.value)}
                  className="mt-1"
                  type="password"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  ℹ️ Tax information is required for earnings above $600/year and is handled securely according to local regulations.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handlePrev} variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Complete Setup <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h2>
              <p className="text-gray-600 mb-4">
                Your creator profile is ready. Start uploading videos and earning today.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-green-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✓ Upload your first video</li>
                <li>✓ Share with your audience</li>
                <li>✓ Track earnings in your dashboard</li>
                <li>✓ Withdraw payments monthly</li>
              </ul>
            </div>
            <Button className="w-full">Go to Dashboard</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
